import { v } from 'convex/values';
import {
	query,
	internalMutation,
	internalAction
} from './_generated/server';
import { internal } from './_generated/api';
import { parseFxRatesPayload, parseSwissquoteAsk } from './externalApi';

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export const getCurrencies = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query('currencies').collect();
	}
});

export const getMetals = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query('metals').collect();
	}
});

export const getMetalByName = query({
	args: { name: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query('metals')
			.withIndex('by_name', (q) => q.eq('name', args.name))
			.first();
	}
});

export const getCurrencyByCode = query({
	args: { code: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query('currencies')
			.withIndex('by_code', (q) => q.eq('code', args.code))
			.first();
	}
});

export const getLastFetchTime = query({
	args: {},
	handler: async (ctx) => {
		const lastLog = await ctx.db.query('rateFetchLog').withIndex('by_fetchedAt').order('desc').first();
		return lastLog?.fetchedAt ?? null;
	}
});

export const getRatesSnapshot = query({
	args: {},
	handler: async (ctx) => {
		const [lastLog, metals, currencies] = await Promise.all([
			ctx.db.query('rateFetchLog').withIndex('by_fetchedAt').order('desc').first(),
			ctx.db.query('metals').collect(),
			ctx.db.query('currencies').collect()
		]);

		return {
			lastFetchTime: lastLog?.fetchedAt ?? null,
			metals: metals.map((m) => ({ name: m.name, priceUSD: m.priceUSD })),
			currencies: currencies.map((c) => ({
				code: c.code,
				name: c.name,
				symbol: c.symbol,
				rateToUSD: c.rateToUSD
			}))
		};
	}
});

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

export const pruneRateFetchLog = internalMutation({
	args: { cutoff: v.number() },
	handler: async (ctx, args) => {
		const oldLogs = await ctx.db
			.query('rateFetchLog')
			.withIndex('by_fetchedAt', (q) => q.lt('fetchedAt', args.cutoff))
			.collect();

		for (const log of oldLogs) {
			await ctx.db.delete(log._id);
		}
	}
});

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
			const goldPrice = parseSwissquoteAsk(goldData) ?? 0;

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
			const silverPrice = parseSwissquoteAsk(silverData) ?? 0;

			if (silverPrice > 0) {
				await ctx.runMutation(internal.rates.upsertMetal, {
					name: 'silver',
					priceUSD: silverPrice,
					lastUpdated: now
				});
			}

			const currencyController = new AbortController();
			const currencyTimeoutId = setTimeout(() => currencyController.abort(), 10000);

			let currencyRates: Record<string, number> | null = null;
			try {
				const apiKey = process.env.fxratesapi_api;
				const url = `https://api.fxratesapi.com/latest${apiKey ? `?api_key=${apiKey}` : ''}`;
				const currencyResponse = await fetch(url, { signal: currencyController.signal });
				currencyRates = parseFxRatesPayload(await currencyResponse.json());
			} finally {
				clearTimeout(currencyTimeoutId);
			}

			if (currencyRates) {
				const updates = Object.entries(currencyRates).map(([code, rateToUSD]) => ({
					code,
					rateToUSD
				}));
				await ctx.runMutation(internal.rates.batchUpdateCurrencyRates, { updates });
			}
		} catch (error) {
			console.error('Error fetching rates:', error);
			success = false;
		}

		await ctx.runMutation(internal.rates.logRateFetch, {
			fetchedAt: now,
			metalsSource: 'swissquote',
			currencySource: 'fxratesapi',
			success
		});

		await ctx.runMutation(internal.rates.pruneRateFetchLog, {
			cutoff: now - ONE_MONTH_MS
		});

	}
});

export const batchUpdateCurrencyRates = internalMutation({
	args: {
		updates: v.array(
			v.object({
				code: v.string(),
				rateToUSD: v.number()
			})
		)
	},
	handler: async (ctx, args) => {
		if (args.updates.length === 0) return;

		const currencies = await ctx.db.query('currencies').collect();
		const currencyIdByCode = new Map(currencies.map((currency) => [currency.code, currency._id]));

		for (const update of args.updates) {
			const currencyId = currencyIdByCode.get(update.code);
			if (!currencyId) continue;
			await ctx.db.patch(currencyId, { rateToUSD: update.rateToUSD });
		}
	}
});

export const refreshRates = internalMutation({
	args: {},
	handler: async (ctx) => {
		await ctx.scheduler.runAfter(0, internal.rates.fetchAllRates, {});
		return { scheduled: true };
	}
});
