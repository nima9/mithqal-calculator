<!--
	+page.svelte
	Home page - renders the calculator with geo-based default currency and timezone.
	URL parameters (q, m, c) are read client-side via $page.url.searchParams.
-->

<script lang="ts">
	import Calculator from '$lib/components/Calculator.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: 'Mithqál Calculator',
		url: 'https://mithqal.app/',
		description:
			'Free mithqál calculator: convert mithqals of gold and silver to any currency with live precious metal and exchange rates.',
		applicationCategory: 'FinanceApplication',
		operatingSystem: 'Web',
		browserRequirements: 'Requires JavaScript',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		}
	};
</script>

<svelte:head>
	<link rel="canonical" href="https://mithqal.app/" />
	<script type="application/ld+json">{JSON.stringify(structuredData)}</script>
</svelte:head>

<Calculator
	selectedCurrency={data.defaultCurrency}
	timezone={data.timezone}
	initialRates={data.initialRates}
/>
