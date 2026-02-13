<!--
	+page.svelte
	Home page - renders the calculator with geo-based default currency and timezone.
	URL parameters (q, m, c) are read client-side via $page.url.searchParams.
-->

<script lang="ts">
	import Calculator from '$lib/components/Calculator.svelte';

	let { data } = $props();
</script>

<Calculator
	selectedCurrency={data.defaultCurrency}
	timezone={data.timezone}
	initialRates={data.initialRates}
/>
