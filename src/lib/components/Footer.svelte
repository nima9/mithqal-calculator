<!--
	Footer.svelte
	Site footer with sponsor callout and attribution.
	Email is protected by Cloudflare Turnstile verification.

	Flow:
	1. User clicks "Reach out!" button
	2. Turnstile challenge loads and displays
	3. The fresh token is verified by the same server operation that returns the email
	4. Email is cached for the browser tab and displayed with email and copy controls
	5. The visitor explicitly chooses whether to open their email client or copy the address
-->

<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { browser } from '$app/environment';
	import { loadTurnstileScript } from '$lib/utils/turnstile';
	import { getEmail } from '$lib/turnstile.remote';

	// ============================================
	// Constants
	// ============================================

	const EMAIL_CACHE_KEY = 'contact_email';
	const TURNSTILE_SITE_KEY = env.PUBLIC_TURNSTILE_SITE_KEY;

	// ============================================
	// State
	// ============================================

	let showTurnstile = $state(false);
	let turnstileReady = $state(false);
	let email = $state<string | null>(null);
	let isVerifying = $state(false);
	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let canRetry = $state(false);
	let copyMessage = $state('click to copy');
	let widgetId: string | null = null;
	let copyResetTimer: ReturnType<typeof setTimeout> | null = null;

	onMount(() => {
		email = sessionStorage.getItem(EMAIL_CACHE_KEY);
	});

	onDestroy(() => {
		if (copyResetTimer) clearTimeout(copyResetTimer);
	});

	// ============================================
	// Helpers
	// ============================================

	/** Verify a fresh token and reveal the email address. */
	async function fetchEmail(token: string) {
		isLoading = true;
		error = null;
		canRetry = false;

		try {
			const result = await getEmail({ token });

			if (result.success) {
				email = result.email;
				sessionStorage.setItem(EMAIL_CACHE_KEY, result.email);
			} else {
				error = result.error || 'Failed to get contact email.';
				canRetry = true;
			}
		} catch {
			error = 'Something went wrong. Please try again.';
			canRetry = true;
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
		const cachedEmail = email || (browser ? sessionStorage.getItem(EMAIL_CACHE_KEY) : null);
		if (cachedEmail) {
			email = cachedEmail;
			return;
		}

		if (!TURNSTILE_SITE_KEY) {
			error = 'Contact verification is not configured.';
			return;
		}

		// Need to verify first
		showTurnstile = true;
		error = null;
		canRetry = false;
		try {
			await loadTurnstileScript();
			turnstileReady = true;
		} catch {
			error = 'Human verification could not load. Please try again.';
			canRetry = true;
		}
	}

	/**
	 * Callback when Turnstile challenge is completed.
	 * Verifies token, stores verification, then fetches email.
	 * @param token - Turnstile token from successful challenge
	 */
	async function onTurnstileSuccess(token: string) {
		isVerifying = true;
		error = null;
		canRetry = false;

		try {
			await fetchEmail(token);
			if (email) showTurnstile = false;
		} finally {
			isVerifying = false;
		}
	}

	function onTurnstileError(errorCode: string) {
		const code = /^\d{3,6}$/.test(errorCode) ? ` (error ${errorCode})` : '';
		error = `Human verification could not run${code}. Please try again or use another browser.`;
		canRetry = true;
	}

	function onTurnstileExpired() {
		error = 'Human verification expired. Please try again.';
		canRetry = true;
	}

	function retryTurnstile() {
		error = null;
		canRetry = false;
		if (widgetId) {
			window.turnstile?.reset(widgetId);
			return;
		}

		void handleReachOutClick();
	}

	async function copyEmail() {
		if (!email) return;

		if (copyResetTimer) clearTimeout(copyResetTimer);

		try {
			await navigator.clipboard.writeText(email);
			copyMessage = 'Copied!';
		} catch {
			copyMessage = 'Copy failed';
		}

		copyResetTimer = setTimeout(() => {
			copyMessage = 'click to copy';
			copyResetTimer = null;
		}, 2000);
	}

	// ============================================
	// Turnstile Setup
	// ============================================

	/**
	 * Svelte action to render Turnstile widget.
	 * Automatically cleans up on component destroy.
	 */
	function setupTurnstile(node: HTMLElement) {
		if (!browser || !window.turnstile || !TURNSTILE_SITE_KEY) return;

		const renderedWidgetId = window.turnstile.render(node, {
			sitekey: TURNSTILE_SITE_KEY,
			callback: onTurnstileSuccess,
			theme: 'dark',
			action: 'contact_email',
			retry: 'never',
			'error-callback': onTurnstileError,
			'expired-callback': onTurnstileExpired,
			'timeout-callback': onTurnstileExpired
		});
		widgetId = renderedWidgetId;

		return {
			destroy() {
				window.turnstile?.remove(renderedWidgetId);
				if (widgetId === renderedWidgetId) widgetId = null;
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
					{#if turnstileReady}
						<div use:setupTurnstile></div>
					{:else if !error}
						<p class="text-sm text-accent">Loading...</p>
					{/if}
					{#if isVerifying}
						<p class="text-sm text-accent">Verifying...</p>
					{/if}
					{#if error}
						<p class="text-sm text-error">{error}</p>
					{/if}
					{#if canRetry}
						<button type="button" class="btn btn-sm btn-outline" onclick={retryTurnstile}>
							Try again
						</button>
					{/if}
				</div>
			{:else if email}
				<div class="mt-3 inline-flex items-center gap-2">
					<a href={`mailto:${email}`} class="btn btn-outline btn-accent px-6 py-2 text-base">
						Email {email}
					</a>
					<div
						class:tooltip-open={copyMessage !== 'click to copy'}
						class="tooltip tooltip-top"
						data-tip={copyMessage}
					>
						<button
							type="button"
							class="btn btn-square btn-ghost btn-sm"
							onclick={copyEmail}
							aria-label="Copy email address"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="size-4"
								aria-hidden="true"
							>
								<rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
								<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
							</svg>
						</button>
					</div>
				</div>
			{:else}
				<button
					type="button"
					onclick={handleReachOutClick}
					disabled={isLoading}
					class="btn btn-outline btn-accent mt-3 px-6 py-2 text-base"
				>
					{#if isLoading}
						<span class="loading loading-sm"></span>
					{:else}
						Reach out!
					{/if}
				</button>
				{#if error}
					<p class="mt-2 text-sm text-error">{error}</p>
				{/if}
			{/if}
		</div>
	</div>
</footer>
