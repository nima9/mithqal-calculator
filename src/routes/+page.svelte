<script lang="ts">
	import Calculator from '$lib/components/Calculator.svelte';
	import { browser } from '$app/environment';

	let { data } = $props();
</script>

{#if browser}
	<Calculator selectedCurrency={data.defaultCurrency} />
{:else}
	<div class="flex items-center justify-center pt-32 text-4xl text-green-300">Loading...</div>
{/if}
