<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	interface Props {
		measurementId: string;
		requiresConsent: boolean;
	}

	let { measurementId, requiresConsent }: Props = $props();
	let initialized = $state(false);
	let lastTrackedUrl = '';

	onMount(() => {
		if (!/^G-[A-Z0-9]+$/.test(measurementId)) return;

		window.dataLayer = window.dataLayer || [];
		window.gtag =
			window.gtag ||
			function gtag(...args: unknown[]) {
				window.dataLayer?.push(args);
			};

		const defaultConsent = requiresConsent ? 'denied' : 'granted';
		window.gtag('consent', 'default', {
			analytics_storage: defaultConsent,
			ad_storage: defaultConsent,
			ad_user_data: defaultConsent,
			ad_personalization: defaultConsent
		});
		if (requiresConsent) {
			window.gtag('consent', 'update', {
				analytics_storage: 'granted',
				ad_storage: 'granted',
				ad_user_data: 'granted',
				ad_personalization: 'granted'
			});
		}
		window.gtag('js', new Date());
		window.gtag('config', measurementId, { send_page_view: false });

		const script = document.createElement('script');
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
		document.head.appendChild(script);
		initialized = true;
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
