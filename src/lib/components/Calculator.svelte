<!--
	Calculator.svelte
	Main calculator component for converting mithqals of gold/silver to currency values.
	Fetches rates from Convex and caches them in localStorage for performance.
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';
	import CurrencyCombobox from './Combobox.svelte';
	import Footer from './Footer.svelte';
	import RatesTimestamp from './RatesTimestamp.svelte';

	// ============================================
	// Constants
	// ============================================

	const MITHQAL_IN_TROY_OZ = 0.11708228065358918;
	const CACHE_KEY = 'mithqal_rates_cache';

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

	// ============================================
	// Props
	// ============================================

	interface Props {
		selectedCurrency?: string;
		timezone?: string;
	}

	let { selectedCurrency = $bindable('$ USD'), timezone = 'America/Los_Angeles' }: Props = $props();

	// ============================================
	// State
	// ============================================

	// User inputs
	let mithqalAmount = $state('19');
	let selectedMetal = $state('Gold');
	let copyTooltipText = $state('Click to copy');

	// Cache state
	let cachedMetals = $state<CachedMetal[]>([]);
	let cachedCurrencies = $state<CachedCurrency[]>([]);
	let cachedLastFetch = $state<number>(0);
	let needsFreshData = $state(true);

	// ============================================
	// Convex Queries
	// ============================================

	const lastFetchQuery = useQuery(api.rates.getLastFetchTime, {});
	const metalsQuery = useQuery(api.rates.getMetals, {});
	const currenciesQuery = useQuery(api.rates.getCurrencies, {});

	// ============================================
	// Cache Management
	// ============================================

	// Load cached data from localStorage on mount
	onMount(() => {
		const cached = localStorage.getItem(CACHE_KEY);
		if (!cached) return;

		try {
			const data: CacheData = JSON.parse(cached);
			cachedMetals = data.metals || [];
			cachedCurrencies = data.currencies || [];
			cachedLastFetch = data.lastFetchTime || 0;
		} catch {
			// Invalid cache, will fetch fresh data
		}
	});

	// Check if server has newer data than our cache
	$effect(() => {
		const serverLastFetch = lastFetchQuery.data;
		if (serverLastFetch && serverLastFetch > cachedLastFetch) {
			needsFreshData = true;
		} else if (serverLastFetch && cachedMetals.length > 0 && cachedCurrencies.length > 0) {
			needsFreshData = false;
		}
	});

	// Update cache when fresh data arrives from Convex
	$effect(() => {
		const metals = metalsQuery.data;
		const currencies = currenciesQuery.data;
		const serverLastFetch = lastFetchQuery.data;

		if (metals && currencies && serverLastFetch && needsFreshData) {
			cachedMetals = metals.map((m) => ({ name: m.name, priceUSD: m.priceUSD }));
			cachedCurrencies = currencies.map((c) => ({
				code: c.code,
				name: c.name,
				symbol: c.symbol,
				rateToUSD: c.rateToUSD
			}));
			cachedLastFetch = serverLastFetch;

			// Persist to localStorage
			const cacheData: CacheData = {
				lastFetchTime: serverLastFetch,
				metals: cachedMetals,
				currencies: cachedCurrencies
			};
			localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
			needsFreshData = false;
		}
	});

	// ============================================
	// Derived Values
	// ============================================

	// Use cached data, falling back to Convex data if no cache
	let displayMetals = $derived(cachedMetals.length > 0 ? cachedMetals : metalsQuery.data || []);
	let displayCurrencies = $derived(
		cachedCurrencies.length > 0 ? cachedCurrencies : currenciesQuery.data || []
	);
	let displayLastFetch = $derived(cachedLastFetch || lastFetchQuery.data || 0);

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

	let formattedCalculatedValue = $derived(
		calculatedValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	);

	let displayCalculatedValue = $derived.by(() => {
		if (isNaN(calculatedValue) || calculatedValue === 0) return '';

		const currencyCode = selectedCurrency.slice(-3).toUpperCase().trim();
		const currencySymbol = currencyMap.get(currencyCode)?.symbol ?? '$';
		return `${currencySymbol} ${formattedCalculatedValue}`;
	});

	// ============================================
	// Display Helpers
	// ============================================

	let mithqalLabel = $derived(parseFloat(mithqalAmount) > 1 ? 'Mithqals' : 'Mithqal');

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

	/** Copy calculated value to clipboard */
	async function handleCopyClick() {
		try {
			await navigator.clipboard.writeText(formattedCalculatedValue);
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

<!-- Calculator Input Row -->
<div
	class="flex appearance-none flex-wrap items-center justify-center space-x-0 bg-base-100 text-3xl font-medium text-base-content sm:text-4xl md:mx-auto md:text-5xl lg:text-6xl"
>
	<form>
		<!-- Mithqal Amount Input -->
		<input
			autocomplete="off"
			type="text"
			id="mithqalAmount"
			name="mithqalAmount"
			bind:value={mithqalAmount}
			oninput={handleInput}
			class="my-1 w-14 cursor-text appearance-none flex-wrap items-center justify-center border-b-4 border-primary bg-base-100 text-center text-base-content outline-hidden transition-colors duration-200 hover:border-accent focus:border-accent sm:w-14 md:w-20 md:border-b-8 lg:w-24"
		/>

		<label
			for="mithqalAmount"
			class="tooltip pr-4 font-medium text-base-content"
			data-tip="1 Mithqal = 3.642g"
		>
			{mithqalLabel} of
		</label>
	</form>

	<!-- Metal Toggle Button -->
	<button
		type="button"
		onclick={switchSelectedMetal}
		class="cursor-pointer appearance-none border-b-4 border-primary bg-base-100 px-4 text-center text-base-content outline-hidden transition-colors duration-200 hover:border-accent active:border-accent md:border-b-8"
	>
		<div class="my-1">{selectedMetal}</div>
	</button>

	<div class="px-4">in</div>

	<!-- Currency Selector -->
	<CurrencyCombobox currJson={currencyJson} bind:selectedValue={selectedCurrency} />
	<div class="px-4">is:</div>
</div>

<br />

<!-- Calculated Result -->
<div
	class="flex flex-wrap items-center justify-center pt-16 pb-9 text-6xl text-secondary sm:text-7xl md:text-8xl lg:text-9xl"
>
	<button
		class="tooltip tooltip-bottom hover:bg-transparent"
		data-tip={copyTooltipText}
		onclick={handleCopyClick}
		onmouseleave={handleCopyMouseLeave}
	>
		{displayCalculatedValue || '...'}
	</button>
</div>

<RatesTimestamp lastFetchTime={displayLastFetch} {timezone} />

<Footer />
