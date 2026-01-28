<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';
	import CurrencyCombobox from './Combobox.svelte';
	import { onMount } from 'svelte';

	const mithqalWeightInOunces = 0.11708222222; // 1 mithqal in troy ounces
	const CACHE_KEY = 'mithqal_rates_cache';

	// Types for cached data
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

	// Props
	let { selectedCurrency = $bindable('$ USD') }: { selectedCurrency?: string } = $props();

	// State
	let mithqalAmount = $state('19');
	let selectedMetal = $state('Gold');
	let copyTooltipText = $state('Click to copy');

	// Cache state
	let cachedMetals = $state<CachedMetal[]>([]);
	let cachedCurrencies = $state<CachedCurrency[]>([]);
	let cachedLastFetch = $state<number>(0);
	let needsFreshData = $state(true);

	// Load cache on mount
	onMount(() => {
		const cached = localStorage.getItem(CACHE_KEY);
		if (cached) {
			try {
				const data: CacheData = JSON.parse(cached);
				cachedMetals = data.metals || [];
				cachedCurrencies = data.currencies || [];
				cachedLastFetch = data.lastFetchTime || 0;
			} catch {
				// Invalid cache, will fetch fresh
			}
		}
	});

	// Only fetch lastFetchTime initially to check if we need fresh data
	const lastFetchQuery = useQuery(api.rates.getLastFetchTime, {});

	// Conditionally fetch full data only when needed
	const metalsQuery = useQuery(api.rates.getMetals, {});
	const currenciesQuery = useQuery(api.rates.getCurrencies, {});

	// Check if we need fresh data when lastFetchTime arrives
	$effect(() => {
		const serverLastFetch = lastFetchQuery.data;
		if (serverLastFetch && serverLastFetch > cachedLastFetch) {
			needsFreshData = true;
		} else if (serverLastFetch && cachedMetals.length > 0 && cachedCurrencies.length > 0) {
			needsFreshData = false;
		}
	});

	// Update cache when fresh data arrives
	$effect(() => {
		const metals = metalsQuery.data;
		const currencies = currenciesQuery.data;
		const serverLastFetch = lastFetchQuery.data;

		if (metals && currencies && serverLastFetch && needsFreshData) {
			// Update local state
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

	// Date formatting options
	const dateDisplayOptions: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		timeZone: 'America/Los_Angeles',
		timeZoneName: 'short'
	};

	// Use cached data for display (falls back to Convex data if no cache)
	let displayMetals = $derived(cachedMetals.length > 0 ? cachedMetals : metalsQuery.data || []);
	let displayCurrencies = $derived(
		cachedCurrencies.length > 0 ? cachedCurrencies : currenciesQuery.data || []
	);
	let displayLastFetch = $derived(cachedLastFetch || lastFetchQuery.data || 0);

	// Get readable date from last fetch
	let readableRateDate = $derived.by(() => {
		if (!displayLastFetch) return 'Loading...';
		return new Intl.DateTimeFormat('en-US', dateDisplayOptions).format(new Date(displayLastFetch));
	});

	// Build currency lookup map
	let currencyMap = $derived.by(() => {
		if (!displayCurrencies.length)
			return new Map<string, { symbol: string; rateToUSD: number; name: string }>();
		return new Map(
			displayCurrencies.map((c) => [
				c.code,
				{ symbol: c.symbol, rateToUSD: c.rateToUSD, name: c.name }
			])
		);
	});

	// Build metal lookup map
	let metalMap = $derived.by(() => {
		if (!displayMetals.length) return new Map<string, number>();
		return new Map(displayMetals.map((m) => [m.name, m.priceUSD]));
	});

	// Derived values for calculation
	let calculatedValue = $derived.by(() => {
		const currencyCode = selectedCurrency.slice(-3).toUpperCase().trim();
		const metalName = selectedMetal.toLowerCase().trim();

		const metalPrice = metalMap.get(metalName) ?? 0;
		const currencyRate = currencyMap.get(currencyCode)?.rateToUSD ?? 1;
		const amount = parseFloat(mithqalAmount) || 0;

		// Formula: mithqals * troy_oz_per_mithqal * price_per_oz * currency_rate
		const calculation = mithqalWeightInOunces * amount * metalPrice * currencyRate;
		return calculation;
	});

	let formattedCalculatedValue = $derived(
		calculatedValue
			.toFixed(2)
			.toString()
			.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	);

	let displayCalculatedValue = $derived.by(() => {
		const currencyCode = selectedCurrency.slice(-3).toUpperCase().trim();
		const currencyInfo = currencyMap.get(currencyCode);
		const currencySymbol = currencyInfo?.symbol ?? '$';
		return isNaN(calculatedValue) || calculatedValue === 0
			? ''
			: currencySymbol + ' ' + formattedCalculatedValue;
	});

	let mithqalLabel = $derived(parseFloat(mithqalAmount) > 1 ? 'Mithqals' : 'Mithqal');

	// Build currency JSON for combobox (format it expects)
	let currencyJson = $derived.by(() => {
		if (!displayCurrencies.length) return {};
		return Object.fromEntries(
			displayCurrencies.map((c) => [
				c.code,
				{
					code: c.code,
					name: c.name,
					symbol_native: c.symbol
				}
			])
		);
	});

	// Event handlers
	function sanitizeInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const inputValue = target.value;
		const validValue = inputValue.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
		if (inputValue !== validValue) {
			mithqalAmount = validValue;
		}
	}

	function handleInput(event: Event) {
		sanitizeInput(event);
		const target = event.target as HTMLInputElement;
		target.style.width = target.value.length + 1 + 'ch';
	}

	function switchSelectedMetal() {
		selectedMetal = selectedMetal === 'Gold' ? 'Silver' : 'Gold';
	}

	function handleCopyClick() {
		navigator.clipboard.writeText(formattedCalculatedValue);
		copyTooltipText = 'Copied!';
	}

	function handleCopyMouseLeave() {
		setTimeout(() => {
			copyTooltipText = 'Click to copy';
		}, 300);
	}

	function handleCurrencyChange() {
		// Callback for when currency changes in the combobox
		// The calculation will automatically update via $derived
	}
</script>

<div
	class="flex appearance-none flex-wrap items-center justify-center space-x-0 bg-zinc-800 text-3xl font-medium text-green-50 sm:text-4xl md:mx-auto md:text-5xl lg:text-6xl"
>
	<form>
		<input
			autocomplete="off"
			type="text"
			bind:value={mithqalAmount}
			oninput={handleInput}
			class="my-1 w-14 appearance-none flex-wrap items-center justify-center border-b-4 border-green-800 bg-zinc-800 text-center text-green-50 outline-hidden focus:border-green-500 focus:ring-green-500 sm:w-14 md:w-20 md:border-b-8 lg:w-24"
			id="mithqalAmount"
			name="mithqalAmount"
		/>

		<label
			for="mithqalAmount"
			class="flex-warp tooltip pr-4 font-medium text-green-50"
			data-tip="1 Mithqal = 3.642g"
		>
			{mithqalLabel} of
		</label>
	</form>

	<button
		type="button"
		class="appearance-none border-b-4 border-green-800 bg-zinc-800 px-4 text-center text-green-50 outline-hidden active:border-green-500 active:ring-green-500 md:border-b-8"
		onclick={switchSelectedMetal}
	>
		<div class="my-1">{selectedMetal}</div>
	</button>
	<div class="px-4">in</div>
	<CurrencyCombobox
		currJson={currencyJson}
		bind:selectedValue={selectedCurrency}
		onCurrencyChange={handleCurrencyChange}
	/>
</div>

<br />
<div
	class="flex flex-wrap items-center justify-center pt-16 pb-9 text-6xl text-green-300 sm:text-7xl md:text-8xl lg:text-9xl"
>
	<button
		class="tooltip tooltip-bottom hover:bg-transparent"
		data-tip={copyTooltipText}
		onclick={handleCopyClick}
		onmouseleave={handleCopyMouseLeave}
	>
		{displayCalculatedValue || 'Loading...'}
	</button>
</div>

<div class="flex flex-wrap items-center justify-center px-7 pt-24 pb-1 text-gray-400">
	Rates as of: {readableRateDate}
</div>

<!-- Sponsor Section -->
<div class="mt-12 text-center text-gray-400">
	<p class="text-lg font-medium text-green-600">Special Sponsor</p>
	<p class="mt-2 text-sm">
		We're looking for sponsors to keep this project alive and perhaps ad-free
	</p>
	<a
		href="https://github.com/nima9/mithqal-culator"
		class="mt-2 inline-block text-green-500 hover:underline"
	>
		Support the project
	</a>
</div>

<!-- Made by Section -->
<div class="mt-8 pb-8 text-center text-gray-500">Made by Nima</div>
