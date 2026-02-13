<!--
	Calculator.svelte
	Main calculator component for converting mithqals of gold/silver to currency values.
	Fetches rates from Convex and caches them in localStorage for performance.
	Supports URL parameters for shareable state (q=quantity, m=metal, c=currency).

	Flow:
	1. Load cached rates from localStorage (if available)
	2. Query Convex for latest lastFetchTime to check if cache is stale
	3. If stale, fetch fresh metals and currencies from Convex
	4. Cache new data in localStorage for future visits
	5. Calculate: mithqals × troy_oz_per_mithqal × metal_price × currency_rate
	6. Sync calculator state with URL parameters (debounced)
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';
	import CurrencyCombobox from './Combobox.svelte';
	import Footer from './Footer.svelte';
	import RatesTimestamp from './RatesTimestamp.svelte';
	import Sentence from './Sentence.svelte';
	import { settingsStore } from '$lib/stores/settings.svelte';

	// ============================================
	// Constants
	// ============================================

	const MITHQAL_IN_TROY_OZ = 0.11708228065358918;
	const CACHE_KEY = 'mithqal_rates_cache';
	const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
	const URL_UPDATE_DEBOUNCE_MS = 300;

	// Default values for URL param comparison
	const DEFAULT_QUANTITY = '19';
	const DEFAULT_METAL = 'Gold';
	const DEFAULT_CURRENCY_CODE = 'USD';
	const VALID_METALS = ['Gold', 'Silver'];

	// ============================================
	// Types
	// ============================================

	interface CachedMetal {
		name: string;
		priceUSD: number;
	}

	interface CachedCurrency {
		code: string;
		name: string;
		symbol: string;
		rateToUSD: number;
	}

	interface CacheData {
		lastFetchTime: number;
		metals: CachedMetal[];
		currencies: CachedCurrency[];
	}

	interface RatesSnapshot {
		lastFetchTime: number | null;
		metals: CachedMetal[];
		currencies: CachedCurrency[];
	}

	// ============================================
	// Props
	// ============================================

	interface Props {
		selectedCurrency?: string;
		timezone?: string;
		initialRates?: RatesSnapshot | null;
	}

	let {
		selectedCurrency = $bindable('$ USD'),
		timezone = 'America/Los_Angeles',
		initialRates = null
	}: Props = $props();

	// ============================================
	// URL Params (read directly from page state)
	// ============================================

	/** Parse and validate quantity from URL */
	let urlQuantity = $derived.by(() => {
		const q = page.url.searchParams.get('q');
		if (q) {
			const parsed = parseFloat(q);
			if (!isNaN(parsed) && parsed > 0) return q;
		}
		return DEFAULT_QUANTITY;
	});

	/** Parse and validate metal from URL */
	let urlMetal = $derived.by(() => {
		const m = page.url.searchParams.get('m');
		if (m) {
			const normalized = m.charAt(0).toUpperCase() + m.slice(1).toLowerCase();
			if (VALID_METALS.includes(normalized)) return normalized;
		}
		return DEFAULT_METAL;
	});

	/** Parse and validate currency code from URL */
	let urlCurrencyCode = $derived(page.url.searchParams.get('c')?.toUpperCase() ?? null);

	// ============================================
	// State
	// ============================================

	// User inputs (initialized from URL params)
	let mithqalAmount = $state(DEFAULT_QUANTITY);
	let selectedMetal = $state(DEFAULT_METAL);
	let copyTooltipText = $state('Click to copy');

	// URL sync state
	let urlUpdateTimeout: ReturnType<typeof setTimeout> | null = null;
	let isInitialized = $state(false);

	// Cache state
	let cachedMetals = $state<CachedMetal[]>([]);
	let cachedCurrencies = $state<CachedCurrency[]>([]);
	let cachedLastFetch = $state<number>(0);
	const convex = useConvexClient();

	// ============================================
	// Cache Management
	// ============================================

	function isCacheStale(lastFetchTime: number): boolean {
		if (!lastFetchTime) return true;
		return Date.now() - lastFetchTime > CACHE_TTL_MS;
	}

	function applyRatesSnapshot(snapshot: RatesSnapshot, persistToCache: boolean) {
		if (
			!snapshot.lastFetchTime ||
			snapshot.metals.length === 0 ||
			snapshot.currencies.length === 0
		) {
			return;
		}

		cachedMetals = snapshot.metals;
		cachedCurrencies = snapshot.currencies;
		cachedLastFetch = snapshot.lastFetchTime;

		if (persistToCache) {
			const cacheData: CacheData = {
				lastFetchTime: snapshot.lastFetchTime,
				metals: snapshot.metals,
				currencies: snapshot.currencies
			};
			localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
		}
	}

	async function fetchRatesSnapshot() {
		try {
			const snapshot = await convex.query(api.rates.getRatesSnapshot, {});
			applyRatesSnapshot(snapshot, true);
		} catch {
			// Keep using current cache state on query failures
		}
	}

	// Load cached data and initialize state on mount
	onMount(async () => {
		const cached = localStorage.getItem(CACHE_KEY);
		if (cached) {
			try {
				const data: CacheData = JSON.parse(cached);
				cachedMetals = data.metals || [];
				cachedCurrencies = data.currencies || [];
				cachedLastFetch = data.lastFetchTime || 0;
			} catch {
				// Invalid cache, will fetch fresh data
			}
		}

		// Initialize state from URL params
		mithqalAmount = urlQuantity;
		selectedMetal = urlMetal;

		const hasValidCache =
			cachedMetals.length > 0 && cachedCurrencies.length > 0 && !isCacheStale(cachedLastFetch);
		const hasNewerServerData =
			!!initialRates?.lastFetchTime && initialRates.lastFetchTime > cachedLastFetch;

		// Prefer server snapshot from SSR when it's newer than local cache.
		if (initialRates && hasNewerServerData) {
			applyRatesSnapshot(initialRates, true);
		}

		if (!hasValidCache && initialRates) {
			applyRatesSnapshot(initialRates, true);
		}

		const needsSnapshotFetch =
			cachedMetals.length === 0 || cachedCurrencies.length === 0 || isCacheStale(cachedLastFetch);

		if (needsSnapshotFetch && !(initialRates && initialRates.lastFetchTime)) {
			await fetchRatesSnapshot();
		}

		isInitialized = true;

		return () => {
			// Cleanup debounce timeout on unmount
			if (urlUpdateTimeout) {
				clearTimeout(urlUpdateTimeout);
			}
		};
	});

	// Apply currency code from URL params once currencies are loaded
	$effect(() => {
		if (urlCurrencyCode && displayCurrencies.length > 0 && !isInitialized) {
			const currency = displayCurrencies.find((c) => c.code === urlCurrencyCode);
			if (currency) {
				selectedCurrency = `${currency.symbol} ${currency.code}`;
			}
		}
	});

	// Sync calculator state to URL (debounced)
	$effect(() => {
		// Only sync after initialization to avoid updating URL on initial load
		if (!isInitialized) return;

		// Track these values to trigger effect on change
		const quantity = mithqalAmount;
		const metal = selectedMetal;
		const currencyCode = selectedCurrency.slice(-3).toUpperCase().trim();
		const newUrl = buildUrlParams(quantity, metal, currencyCode);
		const currentUrl = `${page.url.pathname}${page.url.search}`;

		// No-op when URL is already in sync.
		if (currentUrl === newUrl) {
			if (urlUpdateTimeout) {
				clearTimeout(urlUpdateTimeout);
				urlUpdateTimeout = null;
			}
			return;
		}

		// Clear existing timeout
		if (urlUpdateTimeout) {
			clearTimeout(urlUpdateTimeout);
		}

		// Debounce URL updates
		urlUpdateTimeout = setTimeout(() => {
			updateUrlParams(quantity, metal, currencyCode);
		}, URL_UPDATE_DEBOUNCE_MS);
	});

	// ============================================
	// URL Param Sync
	// ============================================

	/**
	 * Update URL with current calculator state.
	 * Only adds params when values differ from defaults.
	 */
	function buildUrlParams(quantity: string, metal: string, currencyCode: string): string {
		const params = new URLSearchParams();

		// Only add params when different from defaults
		if (quantity !== DEFAULT_QUANTITY) {
			params.set('q', quantity);
		}
		if (metal !== DEFAULT_METAL) {
			params.set('m', metal);
		}
		if (currencyCode !== DEFAULT_CURRENCY_CODE) {
			params.set('c', currencyCode);
		}

		const paramString = params.toString();
		return paramString ? `/?${paramString}` : '/';
	}

	function updateUrlParams(quantity: string, metal: string, currencyCode: string) {
		const newUrl = buildUrlParams(quantity, metal, currencyCode);

		const currentUrl = `${page.url.pathname}${page.url.search}`;
		if (currentUrl === newUrl) return;

		// Replace URL state without triggering route navigation work.
		replaceState(resolve(newUrl), page.state); //not an error
	}

	// ============================================
	// Derived Values
	// ============================================

	let displayMetals = $derived(cachedMetals);
	let displayCurrencies = $derived(cachedCurrencies);
	let displayLastFetch = $derived(cachedLastFetch);

	// Lookup maps for fast access
	let currencyMap = $derived.by(() => {
		if (!displayCurrencies.length) {
			return new Map<string, { symbol: string; rateToUSD: number; name: string }>();
		}
		return new Map(
			displayCurrencies.map((c) => [
				c.code,
				{ symbol: c.symbol, rateToUSD: c.rateToUSD, name: c.name }
			])
		);
	});

	let metalMap = $derived.by(() => {
		if (!displayMetals.length) return new Map<string, number>();
		return new Map(displayMetals.map((m) => [m.name, m.priceUSD]));
	});

	// Format currency data for the combobox component
	let currencyJson = $derived.by(() => {
		if (!displayCurrencies.length) return {};
		return Object.fromEntries(
			displayCurrencies.map((c) => [
				c.code,
				{ code: c.code, name: c.name, symbol_native: c.symbol }
			])
		);
	});

	// ============================================
	// Calculation
	// ============================================

	let calculatedValue = $derived.by(() => {
		const currencyCode = selectedCurrency.slice(-3).toUpperCase().trim();
		const metalName = selectedMetal.toLowerCase().trim();

		const metalPrice = metalMap.get(metalName) ?? 0;
		const currencyRate = currencyMap.get(currencyCode)?.rateToUSD ?? 1;
		const amount = parseFloat(mithqalAmount) || 0;

		// Formula: mithqals × troy_oz_per_mithqal × price_per_oz × currency_rate
		return MITHQAL_IN_TROY_OZ * amount * metalPrice * currencyRate;
	});

	let formattedCalculatedValue = $derived.by(() => {
		const fixed = calculatedValue.toFixed(2);
		const withCommas = fixed.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		// Remove .00 for whole numbers
		return withCommas.endsWith('.00') ? withCommas.slice(0, -3) : withCommas;
	});

	let displayCalculatedValue = $derived.by(() => {
		if (isNaN(calculatedValue) || calculatedValue === 0) return '';

		const currencyCode = selectedCurrency.slice(-3).toUpperCase().trim();
		const currencySymbol = currencyMap.get(currencyCode)?.symbol ?? '$';
		return `${currencySymbol} ${formattedCalculatedValue}`;
	});

	// ============================================
	// Display Helpers
	// ============================================

	let mithqalLabel = $derived(parseFloat(mithqalAmount) > 1 ? 'Mithqáls' : 'Mithqál');

	/** Font size class - large by default, smaller only for long values on mobile */
	let resultSizeClass = $derived.by(() => {
		const len = displayCalculatedValue.length;
		if (len > 18) return 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl';
		return 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl';
	});

	// ============================================
	// Event Handlers
	// ============================================

	/** Sanitize input to only allow numbers and one decimal point */
	function sanitizeInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const validValue = target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
		if (target.value !== validValue) {
			mithqalAmount = validValue;
		}
	}

	/** Handle input changes and resize field to fit content */
	function handleInput(event: Event) {
		sanitizeInput(event);
		const target = event.target as HTMLInputElement;
		target.style.width = `${target.value.length + 1}ch`;
	}

	/** Toggle between Gold and Silver */
	function switchSelectedMetal() {
		selectedMetal = selectedMetal === 'Gold' ? 'Silver' : 'Gold';
	}

	/** Copy calculated value to clipboard (respects comma setting) */
	async function handleCopyClick() {
		try {
			const valueToCopy = settingsStore.copyWithCommas
				? formattedCalculatedValue
				: formattedCalculatedValue.replace(/,/g, '');
			await navigator.clipboard.writeText(valueToCopy);
			copyTooltipText = 'Copied!';
		} catch {
			copyTooltipText = 'Failed to copy';
		}
	}

	/** Reset tooltip text after mouse leaves */
	function handleCopyMouseLeave() {
		setTimeout(() => {
			copyTooltipText = 'Click to copy';
		}, 300);
	}
</script>

{#snippet amount()}
	<input
		autocomplete="off"
		type="text"
		id="mithqalAmount"
		name="mithqalAmount"
		bind:value={mithqalAmount}
		oninput={handleInput}
		class="input-underline mb-1 w-14 cursor-text appearance-none bg-base-100 pb-1 text-center text-base-content outline-hidden sm:w-14 md:w-20 md:pb-2 lg:w-24"
	/>
{/snippet}

{#snippet mithqalLabelSnippet()}
	<label
		for="mithqalAmount"
		class="tooltip tooltip-top pl-4 font-medium text-base-content"
		data-tip="1 Mithqál = 3.642g"
	>
		{mithqalLabel}
	</label>
{/snippet}

{#snippet metal()}
	<button
		type="button"
		onclick={switchSelectedMetal}
		class="input-underline mb-1 cursor-pointer appearance-none bg-base-100 px-4 pb-1 text-center text-base-content outline-hidden md:pb-3 lg:pb-3"
	>
		{selectedMetal}
	</button>
{/snippet}

{#snippet currency()}
	<CurrencyCombobox currJson={currencyJson} bind:selectedValue={selectedCurrency} />
{/snippet}

<!-- Calculator Input Row -->
<Sentence
	order={[
		{ snippet: 'amount' },
		{ snippet: 'mithqalLabel' },
		'of',
		{ snippet: 'metal' },
		'in',
		{ snippet: 'currency' },
		'is:'
	]}
	snippets={{
		amount,
		mithqalLabel: mithqalLabelSnippet,
		metal,
		currency
	}}
/>

<br />

<!-- Calculated Result -->
<div class="flex w-full items-center justify-center overflow-hidden pt-16 pb-9">
	<button
		class="tooltip tooltip-bottom text-center text-secondary hover:bg-transparent {resultSizeClass}"
		data-tip={copyTooltipText}
		onclick={handleCopyClick}
		onmouseleave={handleCopyMouseLeave}
	>
		{displayCalculatedValue || '...'}
	</button>
</div>

<RatesTimestamp lastFetchTime={displayLastFetch} {timezone} />

<Footer />
