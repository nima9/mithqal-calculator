<!--
	+layout.svelte
	Root layout component that wraps all pages.
	Sets up Convex client, includes global header, and handles page transitions.
-->

<script lang="ts">
	import './layout.css';
	import Header from '$lib/components/Header.svelte';
	import { setupConvex } from 'convex-svelte';
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { browser } from '$app/environment';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	// Initialize Convex client only in browser (not during SSR)
	if (browser) {
		setupConvex(PUBLIC_CONVEX_URL);
	}

	let { children, data } = $props();
</script>

<svelte:head>
	<title>Mithqal Calculator</title>
	<meta name="description" content="Convert mithqals of gold and silver to any currency." />

	<!-- Open Graph (used by iMessage, WhatsApp, SMS platforms) -->
	<meta property="og:title" content="Mithqal Calculator" />
	<meta property="og:description" content="Convert mithqals of gold and silver to any currency." />
	<meta property="og:url" content="https://mithqal.app" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Mithqal Calculator" />
	<meta property="og:locale" content="en_US" />
	<meta property="og:image" content="https://mithqal.app/og.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Mithqal Calculator - Convert mithqals to currency" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:creator" content="@OhNoNima" />
	<meta name="twitter:image" content="https://mithqal.app/og.png" />
	<meta name="twitter:title" content="Mithqal Calculator" />
	<meta name="twitter:description" content="Convert mithqals of gold and silver to any currency." />

	<!-- Other -->
	<meta name="github" content="https://github.com/nima9/mithqal-culator" />
	<link rel="sitemap" href="/sitemap.xml" />
</svelte:head>

<Header currentPath={data.url} />

<!-- Keyed block ensures main content remounts when the URL changes so fly transitions re-run -->
{#key data.url}
	<main
		in:fly={{ y: 20, duration: 300, delay: 300, easing: cubicOut }}
		out:fly={{ y: -20, duration: 300, easing: cubicOut }}
	>
		<!-- Render the active child route's page content -->
		{@render children()}
	</main>
{/key}

<style>
	/* Smooth out fly() page transitions applied to <main> above */
	/* `will-change` + `translateZ(0)` hint GPU compositing / own layer to reduce jank and flicker */
	main {
		will-change: transform, opacity;
		transform: translateZ(0);
	}
</style>
