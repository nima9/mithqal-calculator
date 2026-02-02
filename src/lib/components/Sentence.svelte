<!--
	Sentence.svelte
	Dynamic sentence builder for i18n support.
	Accepts an order array of strings and snippet keys to render in sequence.
-->

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		order: (string | { snippet: string })[];
		snippets: Record<string, Snippet>;
	}

	let { order, snippets }: Props = $props();
</script>

<div
	class="flex appearance-none flex-wrap items-baseline justify-center space-x-0 bg-base-100 text-3xl font-medium text-base-content sm:text-4xl md:mx-auto md:text-5xl lg:text-6xl"
>
	{#each order as item}
		{#if typeof item === 'string'}
			<span class="px-4">{item}</span>
		{:else if item.snippet && snippets[item.snippet]}
			{@render snippets[item.snippet]()}
		{/if}
	{/each}
</div>
