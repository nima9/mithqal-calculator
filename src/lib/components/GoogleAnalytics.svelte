<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { updateGoogleConsent } from '$lib/googleConsent';
	import type { ConsentValue } from '$lib/stores/consent.svelte';

	interface Props {
		measurementId: string;
		requiresConsent: boolean;
		consent: ConsentValue;
	}

	let { measurementId, requiresConsent, consent }: Props = $props();
	let initialized = $state(false);
	let lastConsent: ConsentValue | undefined;
	let lastTrackedUrl = '';

	onMount(() => {
		if (!/^G-[A-Z0-9]+$/.test(measurementId)) return;

		// The server-rendered head initializes gtag and restores saved consent.
		if (!window.gtag) return;
		lastConsent = consent;
		initialized = true;
	});

	$effect(() => {
		if (!initialized || !window.gtag || !requiresConsent || consent === lastConsent) return;

		lastConsent = consent;
		updateGoogleConsent(window.gtag, consent);
	});

	$effect(() => {
		if (!initialized || !window.gtag) return;

		const currentUrl = page.url.href;
		if (currentUrl === lastTrackedUrl) return;
		lastTrackedUrl = currentUrl;

		window.gtag('event', 'page_view', {
			page_title: document.title,
			page_location: currentUrl,
			page_path: `${page.url.pathname}${page.url.search}`
		});
	});
</script>
