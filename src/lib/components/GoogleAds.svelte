<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let adLoaded = $state(false);
	let adError = $state(false);

	onMount(() => {
		if (!browser) return;

		// Check if script already exists
		if (document.querySelector('script[src*="pagead2.googlesyndication.com"]')) {
			initAd();
			return;
		}

		const script = document.createElement('script');
		script.src =
			'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2530428495090242';
		script.async = true;
		script.crossOrigin = 'anonymous';

		script.onload = () => {
			initAd();
		};

		script.onerror = () => {
			adError = true;
		};

		document.head.appendChild(script);
	});

	function initAd() {
		try {
			// @ts-ignore - adsbygoogle is injected by the script
			(window.adsbygoogle = window.adsbygoogle || []).push({});
			adLoaded = true;
		} catch {
			adError = true;
		}
	}
</script>

{#if !adError}
	<div class="ad-container">
		<ins
			class="adsbygoogle"
			style="display:block"
			data-ad-client="ca-pub-2530428495090242"
			data-ad-slot="auto"
			data-ad-format="auto"
			data-full-width-responsive="true"
		></ins>
	</div>
{/if}

<style>
	.ad-container {
		width: 100%;
		min-height: 90px;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 2rem;
		padding: 0 1rem;
	}
</style>
