<!--
	Footer.svelte
	Site footer with sponsor callout and attribution.
	Email is protected by Cloudflare Turnstile verification.

	Flow:
	1. User clicks "Reach out!" button
	2. Turnstile challenge loads and displays
	3. On successful verification, email is fetched from /api/contact
	4. Email is cached and mailto: link opens
	5. Subsequent clicks skip Turnstile and go directly to mailto:
-->

<script lang="ts">
	import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';
	import { browser } from '$app/environment';
	import { loadTurnstileScript } from '$lib/utils/turnstile';

	// ============================================
	// State
	// ============================================

	let showTurnstile = $state(false);
	let turnstileReady = $state(false);
	let email = $state<string | null>(null);
	let isVerifying = $state(false);
	let error = $state<string | null>(null);

	// ============================================
	// Event Handlers
	// ============================================

	/**
	 * Handle "Reach out!" button click.
	 * If email already verified, opens mailto directly.
	 * Otherwise, shows Turnstile challenge.
	 */
	async function handleReachOutClick() {
		if (email) {
			window.location.href = `mailto:${email}`;
			return;
		}
		showTurnstile = true;
		await loadTurnstileScript();
		turnstileReady = true;
	}

	/**
	 * Callback when Turnstile challenge is completed.
	 * Sends token to /api/contact to get the protected email.
	 * @param token - Turnstile token from successful challenge
	 */
	async function onTurnstileSuccess(token: string) {
		isVerifying = true;
		error = null;

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token })
			});

			const data = await response.json();

			if (data.success && data.email) {
				email = data.email;
				showTurnstile = false;
				window.location.href = `mailto:${email}`;
			} else {
				error = 'Verification failed. Please try again.';
			}
		} catch {
			error = 'Something went wrong. Please try again.';
		} finally {
			isVerifying = false;
		}
	}

	// ============================================
	// Turnstile Setup
	// ============================================

	/**
	 * Svelte action to render Turnstile widget.
	 * Automatically cleans up on component destroy.
	 */
	function setupTurnstile(node: HTMLElement) {
		if (!browser || !window.turnstile) return;

		window.turnstile.render(node, {
			sitekey: PUBLIC_TURNSTILE_SITE_KEY,
			callback: onTurnstileSuccess,
			theme: 'dark'
		});

		return {
			destroy() {
				window.turnstile?.remove(node);
			}
		};
	}
</script>

<footer class="mt-12 text-center">
	<div class="px-8 text-neutral-content/60 sm:px-0">
		<div
			class="mx-auto mt-4 max-w-xs rounded-xl border-2 border-dashed border-secondary/50 bg-base-200/20 px-4 py-3 sm:max-w-xl sm:rounded-2xl sm:px-6 sm:py-5"
		>
			<p class="text-base font-medium text-secondary sm:text-lg">Special Sponsor</p>
			<p class="mt-1 text-xs sm:mt-2 sm:text-sm">
				We're looking for sponsors to keep this project alive and perhaps ad-free
			</p>

			{#if showTurnstile && !email}
				<div class="mt-3 flex flex-col items-center gap-2">
					{#if isVerifying}
						<p class="text-sm text-accent">Verifying...</p>
					{:else if turnstileReady}
						<div use:setupTurnstile></div>
					{:else}
						<p class="text-sm text-accent">Loading...</p>
					{/if}
					{#if error}
						<p class="text-sm text-error">{error}</p>
					{/if}
				</div>
			{:else}
				<button
					type="button"
					onclick={handleReachOutClick}
					class="mt-1 inline-block cursor-pointer text-sm text-accent transition-colors duration-200 hover:text-secondary hover:underline sm:mt-2 sm:text-base"
				>
					{email ? `${email}` : 'Reach out!'}
				</button>
			{/if}
		</div>
	</div>

	<p class="mt-8 pb-8 text-neutral-content/50">Made by Nima</p>
</footer>
