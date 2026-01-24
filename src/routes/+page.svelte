<script lang="ts">
	import Calculator from '$lib/components/Calculator.svelte';

	let { data } = $props();
</script>

<Calculator selectedCurrency={data.defaultCurrency} />
