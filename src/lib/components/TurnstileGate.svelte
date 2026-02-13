<script lang="ts">
	import { onMount } from 'svelte';
	import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';
	import { loadTurnstileScript } from '$lib/utils/turnstile';
	import { verifyToken } from '$lib/turnstile.remote';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		storageKey?: string;
	}

	let { children, storageKey = 'about_verified' }: Props = $props();

	let isVerified = $state(false);
	let turnstileReady = $state(false);
	let isVerifying = $state(false);
	let error = $state<string | null>(null);

	onMount(() => {
		void (async () => {
			if (sessionStorage.getItem(storageKey) === 'true') {
				isVerified = true;
				return;
			}

			await loadTurnstileScript();
			turnstileReady = true;
		})();
	});

	async function onTurnstileSuccess(token: string) {
		isVerifying = true;
		error = null;

		try {
			const result = await verifyToken({ token });
			if (result.success) {
				sessionStorage.setItem(storageKey, 'true');
				isVerified = true;
			} else {
				error = result.error || 'Verification failed. Please try again.';
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

{#if isVerified}
	{@render children()}
{:else}
	<div class="flex min-h-[60vh] flex-col items-center justify-center p-8 text-base-content">
		<h1 class="text-2xl font-medium">Verify you're human</h1>
		<p class="mt-2 text-base-content/70">Please complete the challenge to view this page.</p>

		<div class="mt-8 flex flex-col items-center gap-4">
			{#if isVerifying}
				<p class="text-accent">Verifying...</p>
			{:else if turnstileReady}
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
