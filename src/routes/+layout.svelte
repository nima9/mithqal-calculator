<!--
	+layout.svelte
	Root layout component that wraps all pages.
	Sets up Convex client and includes global header.
-->

<script lang="ts">
	import './layout.css';
	import Header from '$lib/components/Header.svelte';
	import { setupConvex } from 'convex-svelte';
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { browser } from '$app/environment';

	// Initialize Convex client only in browser (not during SSR)
	if (browser) {
		setupConvex(PUBLIC_CONVEX_URL);
	}

	let { children } = $props();
</script>

<svelte:head>
	<title>Mithqal Calculator</title>
	<meta name="description" content="A Mithqal Calculator." />

	<!-- Open Graph -->
	<meta property="og:title" content="Mithqal Calculator" />
	<meta property="og:description" content="A Mithqal Calculator" />
	<meta property="og:url" content="https://mithqal.app" />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://mithqal.app/android-chrome-512x512.png" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:creator" content="@OhNoNima" />
	<meta name="twitter:image" content="https://mithqal.app/android-chrome-512x512.png" />
	<meta name="twitter:title" content="Mithqal Calculator" />
	<meta name="twitter:description" content="A Mithqal Calculator." />

	<!-- Other -->
	<meta name="github" content="https://github.com/nima9/mithqal-culator" />
	<link rel="sitemap" href="/sitemap.xml" />
</svelte:head>

<Header />

{@render children()}
