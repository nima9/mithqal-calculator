<!--
	about/+page.svelte
	About page with Turnstile verification gate.
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';

	const VERIFIED_KEY = 'about_verified';

	let isVerified = $state(false);
	let showTurnstile = $state(false);
	let turnstileReady = $state(false);
	let isVerifying = $state(false);
	let error = $state<string | null>(null);

	onMount(() => {
		// Check if already verified this session
		if (sessionStorage.getItem(VERIFIED_KEY) === 'true') {
			isVerified = true;
		} else {
			showTurnstile = true;
			loadTurnstileScript();
		}
	});

	function loadTurnstileScript() {
		if (window.turnstile) {
			turnstileReady = true;
			return;
		}

		const script = document.createElement('script');
		script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
		script.async = true;
		script.onload = () => {
			turnstileReady = true;
		};
		document.head.appendChild(script);
	}

	async function onTurnstileSuccess(token: string) {
		isVerifying = true;
		error = null;

		try {
			const response = await fetch('/api/verify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token })
			});

			const data = await response.json();

			if (data.success) {
				sessionStorage.setItem(VERIFIED_KEY, 'true');
				isVerified = true;
				showTurnstile = false;
			} else {
				error = 'Verification failed. Please try again.';
			}
		} catch {
			error = 'Something went wrong. Please try again.';
		} finally {
			isVerifying = false;
		}
	}

	function setupTurnstile(node: HTMLElement) {
		if (!window.turnstile) return;

		window.turnstile.render(node, {
			sitekey: PUBLIC_TURNSTILE_SITE_KEY,
			callback: onTurnstileSuccess,
			theme: 'auto'
		});

		return {
			destroy() {
				window.turnstile?.remove(node);
			}
		};
	}
</script>

<svelte:head>
	<title>About - Mithqal Calculator</title>
</svelte:head>

{#if isVerified}
	<!-- About Page Content -->
	<div class="flex flex-col items-center justify-center p-8 text-base-content">
		<h1 class="text-4xl font-medium">About</h1>
		<p class="mt-4 text-lg">A Mithqal Calculator.</p>
	</div>
{:else}
	<!-- Turnstile Verification Gate -->
	<div class="flex min-h-[60vh] flex-col items-center justify-center p-8 text-base-content">
		<h1 class="text-2xl font-medium">Verify you're human</h1>
		<p class="mt-2 text-base-content/70">Please complete the challenge to view this page.</p>

		<div class="mt-8 flex flex-col items-center gap-4">
			{#if isVerifying}
				<p class="text-accent">Verifying...</p>
			{:else if turnstileReady && showTurnstile}
				<div use:setupTurnstile></div>
			{:else}
				<p class="text-accent">Loading...</p>
			{/if}

			{#if error}
				<p class="text-error">{error}</p>
			{/if}
		</div>
	</div>
{/if}
