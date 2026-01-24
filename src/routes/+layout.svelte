<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>Mithqal Calculator</title>
	<meta name="description" content="A Mithqal Calculator." />
	<meta property="og:title" content="Mithqal Calculator" />
	<meta property="og:description" content="A Mithqal Calculator" />
	<meta property="og:url" content="https://mithqal.app" />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://mithqal.app/android-chrome-512x512.png" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:creator" content="@OhNoNima" />
	<meta name="twitter:image" content="https://mithqal.app/android-chrome-512x512.png" />
	<meta name="twitter:title" content="Mithqal Calculator" />
	<meta name="twitter:description" content="A Mithqal Calculator." />
	<meta name="github" content="https://github.com/nima9/mithqal-culator" />
	<link rel="sitemap" href="/sitemap.xml" />
</svelte:head>

<Header />

{@render children()}
