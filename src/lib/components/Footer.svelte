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
	import { verifyToken, getEmail } from '$lib/turnstile.remote';

	// ============================================
	// Constants
	// ============================================

	/** SessionStorage key for tracking verification status (shared with About/Support pages) */
	const VERIFIED_KEY = 'about_verified';

	// ============================================
	// State
	// ============================================

	let showTurnstile = $state(false);
	let turnstileReady = $state(false);
	let email = $state<string | null>(null);
	let isVerifying = $state(false);
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	// ============================================
	// Helpers
	// ============================================

	/** Check if user is already verified via sessionStorage */
	function isAlreadyVerified(): boolean {
		return browser && sessionStorage.getItem(VERIFIED_KEY) === 'true';
	}

	/** Fetch email from server and open mailto */
	async function fetchEmailAndOpen() {
		isLoading = true;
		error = null;

		try {
			const result = await getEmail({});

			if (result.success) {
				email = result.email;
				window.location.href = `mailto:${email}`;
			} else {
				error = result.error || 'Failed to get contact email.';
			}
		} catch {
			error = 'Something went wrong. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	// ============================================
	// Event Handlers
	// ============================================

	/**
	 * Handle "Reach out!" button click.
	 * If already verified (via sessionStorage), fetches email directly.
	 * Otherwise, shows Turnstile challenge first.
	 */
	async function handleReachOutClick() {
		// Already have email cached
		if (email) {
			window.location.href = `mailto:${email}`;
			return;
		}

		// Already verified on About/Support page - skip Turnstile
		if (isAlreadyVerified()) {
			await fetchEmailAndOpen();
			return;
		}

		// Need to verify first
		showTurnstile = true;
		await loadTurnstileScript();
		turnstileReady = true;
	}

	/**
	 * Callback when Turnstile challenge is completed.
	 * Verifies token, stores verification, then fetches email.
	 * @param token - Turnstile token from successful challenge
	 */
	async function onTurnstileSuccess(token: string) {
		isVerifying = true;
		error = null;

		try {
			const result = await verifyToken({ token });

			if (result.success) {
				// Store verification (shared with About/Support pages)
				sessionStorage.setItem(VERIFIED_KEY, 'true');
				showTurnstile = false;

				// Now fetch email and open mailto
				await fetchEmailAndOpen();
			} else {
				error = result.error || 'Verification failed. Please try again.';
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

<footer class="mt-12 pb-8 text-center">
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
					disabled={isLoading}
					class="btn btn-outline btn-accent mt-3 px-6 py-2 text-base"
				>
					{#if isLoading}
						<span class="loading loading-spinner loading-sm"></span>
					{:else}
						{email ? `${email}` : 'Reach out!'}
					{/if}
				</button>
				{#if error}
					<p class="mt-2 text-sm text-error">{error}</p>
				{/if}
			{/if}
		</div>
	</div>
</footer>
