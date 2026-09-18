<!--
	Sentence.svelte
	Dynamic sentence builder for flexible word order (i18n support).
	Renders a language's ordered sentence parts: literal words and named
	snippet slots for the interactive controls.

	Example usage:
	<Sentence
		language={sentenceLanguage}
		snippets={{ amount, mithqalLabel, metal, currency }}
	/>
-->

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SentenceLanguage, SentenceSlot } from '$lib/sentences';

	interface Props {
		language: SentenceLanguage;
		snippets: Record<SentenceSlot, Snippet>;
	}

	let { language, snippets }: Props = $props();
</script>

<div
	dir={language.dir}
	class="flex appearance-none flex-wrap items-baseline justify-center space-x-0 overflow-visible bg-base-100 pt-8 text-3xl font-medium text-base-content sm:text-4xl md:mx-auto md:text-5xl lg:text-6xl"
>
	{#each language.items as item}
		{#if typeof item === 'string'}
			<span class="px-4">{item}</span>
		{:else if snippets[item.snippet]}
			{@render snippets[item.snippet]()}
		{/if}
	{/each}
</div>
