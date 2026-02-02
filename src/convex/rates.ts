import { v } from 'convex/values';
import {
	query,
	mutation,
	internalMutation,
	internalAction,
	internalQuery
} from './_generated/server';
import { internal } from './_generated/api';

// ============ QUERIES ============

// Get all currencies for the combobox
export const getCurrencies = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query('currencies').collect();
	}
});

// Get metal rates for calculation
export const getMetals = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query('metals').collect();
	}
});

// Get a specific metal by name
export const getMetalByName = query({
	args: { name: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query('metals')
			.withIndex('by_name', (q) => q.eq('name', args.name))
			.first();
	}
});

// Get a specific currency by code
export const getCurrencyByCode = query({
	args: { code: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query('currencies')
			.withIndex('by_code', (q) => q.eq('code', args.code))
			.first();
	}
});

// Get latest fetch timestamp for display
export const getLastFetchTime = query({
	args: {},
	handler: async (ctx) => {
		const lastLog = await ctx.db.query('rateFetchLog').order('desc').first();
		return lastLog?.fetchedAt ?? null;
	}
});

// ============ MUTATIONS ============

// Seed a single currency (used by seedAllCurrencies action)
export const upsertCurrency = internalMutation({
	args: {
		code: v.string(),
		name: v.string(),
		symbol: v.string(),
		rateToUSD: v.number()
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query('currencies')
			.withIndex('by_code', (q) => q.eq('code', args.code))
			.first();

		if (existing) {
			await ctx.db.patch(existing._id, {
				name: args.name,
				symbol: args.symbol,
				rateToUSD: args.rateToUSD
			});
		} else {
			await ctx.db.insert('currencies', args);
		}
	}
});

// Update metal price
export const upsertMetal = internalMutation({
	args: {
		name: v.string(),
		priceUSD: v.number(),
		lastUpdated: v.number()
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query('metals')
			.withIndex('by_name', (q) => q.eq('name', args.name))
			.first();

		if (existing) {
			await ctx.db.patch(existing._id, {
				priceUSD: args.priceUSD,
				lastUpdated: args.lastUpdated
			});
		} else {
			await ctx.db.insert('metals', args);
		}
	}
});

// Log a rate fetch
export const logRateFetch = internalMutation({
	args: {
		fetchedAt: v.number(),
		metalsSource: v.string(),
		currencySource: v.string(),
		success: v.boolean()
	},
	handler: async (ctx, args) => {
		await ctx.db.insert('rateFetchLog', args);
	}
});

// ============ INTERNAL ACTIONS ============

// Fetch all rates from external APIs
export const fetchAllRates = internalAction({
	args: {},
	handler: async (ctx) => {
		const now = Date.now();
		let success = true;

		try {
			// Fetch Gold price from Swissquote
			const goldResponse = await fetch(
				'https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAU/USD'
			);
			const goldData = await goldResponse.json();
			// Use the first platform's standard profile ask price
			const goldPrice = goldData[0]?.spreadProfilePrices?.[0]?.ask ?? 0;

			if (goldPrice > 0) {
				await ctx.runMutation(internal.rates.upsertMetal, {
					name: 'gold',
					priceUSD: goldPrice,
					lastUpdated: now
				});
			}

			// Fetch Silver price from Swissquote
			const silverResponse = await fetch(
				'https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAG/USD'
			);
			const silverData = await silverResponse.json();
			const silverPrice = silverData[0]?.spreadProfilePrices?.[0]?.ask ?? 0;

			if (silverPrice > 0) {
				await ctx.runMutation(internal.rates.upsertMetal, {
					name: 'silver',
					priceUSD: silverPrice,
					lastUpdated: now
				});
			}

			// Fetch currency rates from fxratesapi
			const currencyController = new AbortController();
			const currencyTimeoutId = setTimeout(() => currencyController.abort(), 10000);

			let currencyData: { success?: boolean; rates?: Record<string, number> } = {};
			try {
				const apiKey = process.env.fxratesapi_api;
				const url = `https://api.fxratesapi.com/latest${apiKey ? `?api_key=${apiKey}` : ''}`;
				const currencyResponse = await fetch(url, { signal: currencyController.signal });
				currencyData = await currencyResponse.json();
			} finally {
				clearTimeout(currencyTimeoutId);
			}

			if (currencyData.success && currencyData.rates) {
				// Update rates for existing currencies
				const existingCurrencies = await ctx.runQuery(internal.rates.getAllCurrencyCodes);

				for (const code of existingCurrencies) {
					const rate = currencyData.rates[code];
					if (rate !== undefined) {
						await ctx.runMutation(internal.rates.updateCurrencyRate, {
							code,
							rateToUSD: rate
						});
					}
				}
			}
		} catch (error) {
			console.error('Error fetching rates:', error);
			success = false;
		}

		// Log the fetch
		await ctx.runMutation(internal.rates.logRateFetch, {
			fetchedAt: now,
			metalsSource: 'swissquote',
			currencySource: 'fxratesapi',
			success
		});
	}
});

// Helper query to get all currency codes
export const getAllCurrencyCodes = internalQuery({
	args: {},
	handler: async (ctx) => {
		const currencies = await ctx.db.query('currencies').collect();
		return currencies.map((c) => c.code);
	}
});

// Update just the rate for a currency
export const updateCurrencyRate = internalMutation({
	args: {
		code: v.string(),
		rateToUSD: v.number()
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query('currencies')
			.withIndex('by_code', (q) => q.eq('code', args.code))
			.first();

		if (existing) {
			await ctx.db.patch(existing._id, { rateToUSD: args.rateToUSD });
		}
	}
});

// Internal mutation to manually trigger rate refresh
// Use: bunx convex run rates:refreshRates (from CLI only)
export const refreshRates = internalMutation({
	args: {},
	handler: async (ctx) => {
		await ctx.scheduler.runAfter(0, internal.rates.fetchAllRates, {});
		return { scheduled: true };
	}
});
