<script lang="ts">
	import { consentStore } from '$lib/stores/consent.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}

	let { open = $bindable(), onClose }: Props = $props();

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
		}
	}

	$effect(() => {
		if (!open) return;

		const onWindowKeydown = (e: KeyboardEvent) => handleKeydown(e);
		window.addEventListener('keydown', onWindowKeydown);

		return () => {
			window.removeEventListener('keydown', onWindowKeydown);
		};
	});

	function acceptAndClose() {
		consentStore.accept();
		onClose();
	}

	function declineAndClose() {
		consentStore.decline();
		onClose();
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
		onclick={handleBackdropClick}
		role="button"
		tabindex="0"
		aria-label="Close cookie policy"
		onkeydown={(e) => e.key === 'Enter' && onClose()}
	>
		<div
			class="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-base-100 p-6 shadow-xl"
			role="dialog"
			aria-modal="true"
			aria-labelledby="cookie-modal-title"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="flex items-center justify-between">
				<h2 id="cookie-modal-title" class="text-xl font-medium text-base-content">
					Cookie Policy
				</h2>
				<button
					type="button"
					onclick={onClose}
					class="rounded-full p-1 text-base-content/60 transition-colors hover:bg-base-300 hover:text-base-content"
					aria-label="Close"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<div class="mt-6 space-y-4 text-sm text-base-content/80">
				<section>
					<h3 class="font-medium text-base-content">Essential (Always Active)</h3>
					<p class="mt-1">
						These are required for the site to function. They store your preferences like theme
						and currency settings in your browser's local storage. No data is sent to external
						servers.
					</p>
				</section>

				<section>
					<h3 class="font-medium text-base-content">Analytics (Optional)</h3>
					<p class="mt-1">
						Google Analytics helps us understand how visitors use the site. It collects
						anonymized data about page views and interactions. This data is processed by Google.
					</p>
				</section>

				<section>
					<h3 class="font-medium text-base-content">Advertising (Optional)</h3>
					<p class="mt-1">
						Google AdSense displays ads to support the site. It may use cookies to show
						personalized ads based on your browsing history. If declined, ads will not be shown.
					</p>
				</section>

				<p class="text-xs text-base-content/60">
					You can change your preference at any time by clearing your browser's local storage for
					this site.
				</p>
			</div>

			<div class="mt-6 flex justify-end gap-2">
				<button type="button" onclick={declineAndClose} class="btn btn-ghost">
					Decline All
				</button>
				<button type="button" onclick={acceptAndClose} class="btn btn-primary">
					Accept All
				</button>
			</div>
		</div>
	</div>
{/if}
