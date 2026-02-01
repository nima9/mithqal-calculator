<!--
	+page.svelte
	Home page - renders the calculator with geo-based default currency and timezone.
-->

<script lang="ts">
	import Calculator from '$lib/components/Calculator.svelte';
	import { browser } from '$app/environment';

	let { data } = $props();
</script>

{#if browser}
	<Calculator selectedCurrency={data.defaultCurrency} timezone={data.timezone} />
{:else}
	<!-- SSR placeholder while hydrating -->
	<div class="flex items-center justify-center pt-32 text-4xl text-secondary">...</div>
{/if}
