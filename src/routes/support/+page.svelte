<!--
	support/+page.svelte
	Support page with Turnstile verification gate and donation links.
	Shares verification session with About page via sessionStorage.

	Flow:
	1. Check if user is already verified (sessionStorage)
	2. If not verified, show Cloudflare Turnstile challenge
	3. On successful verification, store in sessionStorage and show content
	4. Content includes Ko-fi and PayPal donation links
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';
	import { loadTurnstileScript } from '$lib/utils/turnstile';
	import { verifyToken } from '$lib/turnstile.remote';
	import Coffee from '$lib/components/icons/Coffee.svelte';
	import Wallet from '$lib/components/icons/Wallet.svelte';

	// ============================================
	// Constants
	// ============================================

	/** SessionStorage key for tracking verification status (shared with About page) */
	const VERIFIED_KEY = 'about_verified';

	// ============================================
	// State
	// ============================================

	let isVerified = $state(false);
	let showTurnstile = $state(false);
	let turnstileReady = $state(false);
	let isVerifying = $state(false);
	let error = $state<string | null>(null);

	// ============================================
	// Turnstile Verification
	// ============================================

	/**
	 * On mount, check if user is already verified.
	 * If not, load the Turnstile script and show the challenge.
	 */
	onMount(async () => {
		if (sessionStorage.getItem(VERIFIED_KEY) === 'true') {
			isVerified = true;
		} else {
			showTurnstile = true;
			await loadTurnstileScript();
			turnstileReady = true;
		}
	});

	/**
	 * Callback when Turnstile challenge is completed.
	 * Sends token to server for verification via remote function.
	 * @param token - Turnstile token from successful challenge
	 */
	async function onTurnstileSuccess(token: string) {
		isVerifying = true;
		error = null;

		try {
			const result = await verifyToken({ token });

			if (result.success) {
				sessionStorage.setItem(VERIFIED_KEY, 'true');
				isVerified = true;
				showTurnstile = false;
			} else {
				error = result.error || 'Verification failed. Please try again.';
			}
		} catch {
			error = 'Something went wrong. Please try again.';
		} finally {
			isVerifying = false;
		}
	}

	/**
	 * Svelte action to render Turnstile widget.
	 * Automatically cleans up on component destroy.
	 */
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
	<title>Support - Mithqal Calculator</title>
</svelte:head>

<!-- ============================================ -->
<!-- Verified Content: Support page              -->
<!-- ============================================ -->
{#if isVerified}
	<div class="mx-auto max-w-2xl px-6 py-8 text-base-content">
		<h1 class="font-karla text-4xl font-medium md:text-5xl">Support</h1>

		<section class="mt-8">
			<p class="text-lg leading-relaxed text-base-content/80">
				The <strong class="text-base-content">Mithqal Calculator</strong> is a free, ad-free tool built
				to serve the community. If you find it useful and would like to help keep it running, consider
				supporting the project.
			</p>
		</section>

		<section class="mt-10">
			<h2 class="font-karla text-2xl font-medium md:text-3xl">Ways to Support</h2>

			<div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<!-- Ko-fi -->
				<a
					href="https://ko-fi.com/nima999"
					target="_blank"
					rel="noopener noreferrer"
					class="group flex flex-col items-center rounded-xl border-2 border-base-300 bg-base-200/30 p-6 transition-all hover:border-primary hover:bg-base-200/60"
				>
					<Coffee size={40} />
					<span
						class="mt-3 font-karla text-xl font-medium text-base-content group-hover:text-primary"
						>Ko-fi</span
					>
					<span class="mt-1 text-sm text-base-content/60">Buy me a coffee</span>
				</a>

				<!-- World Citizen Sticker -->
				<a
					href="https://itsidempotent.com/products/world-citizen-sticker?utm_campaign=eb9a4c&utm_source=shareable_link"
					target="_blank"
					rel="noopener noreferrer"
					class="group flex flex-col items-center rounded-xl border-2 border-base-300 bg-base-200/30 p-6 transition-all hover:border-primary hover:bg-base-200/60"
				>
					<div class="mt-3 w-52 md:mt-1 lg:w-60">
						<enhanced:img
							src="$lib/assets/world_citizen_sticker.webp?w=480;360;256;208"
							sizes="(min-width: 1024px) 240px, 208px"
							alt="World Citizen sticker"
							class="h-auto w-full"
						/>
					</div>
					<span
						class="mt-3 font-karla text-xl font-medium text-base-content group-hover:text-primary"
						>World Citizen Sticker</span
					>
					<span class="mt-1 text-sm text-base-content/60">Buy a sticker</span>
				</a>

				<!-- PayPal -->
				<a
					href="https://paypal.me/jpnima999"
					target="_blank"
					rel="noopener noreferrer"
					class="group flex flex-col items-center rounded-xl border-2 border-base-300 bg-base-200/30 p-6 transition-all hover:border-primary hover:bg-base-200/60"
				>
					<Wallet size={40} />
					<span
						class="mt-3 font-karla text-xl font-medium text-base-content group-hover:text-primary"
						>PayPal</span
					>
					<span class="mt-1 text-sm text-base-content/60">One-time donation</span>
				</a>
			</div>
		</section>

		<section class="mt-10">
			<p class="text-base leading-relaxed text-base-content/60">
				Your support helps cover hosting and domain costs and allows me to continue improving the
				calculator.
			</p>
		</section>
	</div>

	<!-- ============================================ -->
	<!-- Unverified: Turnstile Challenge             -->
	<!-- ============================================ -->
{:else}
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
