<!--
	SettingsModal.svelte
	Modal dialog for user settings.
	Settings are persisted in localStorage via settingsStore.

	Available Settings:
	- Copy format: With commas (1,234.56) or without (1234.56)
-->

<script lang="ts">
	import { settingsStore, setCopyWithCommas } from '$lib/stores/settings.svelte';

	// ============================================
	// Props
	// ============================================

	interface Props {
		open: boolean;
		onClose: () => void;
	}

	let { open = $bindable(), onClose }: Props = $props();

	// ============================================
	// Event Handlers
	// ============================================

	/** Close modal when clicking the backdrop (not the modal itself) */
	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	/** Close modal on Escape or Enter key on backdrop */
	function handleBackdropKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' || e.key === 'Enter') {
			onClose();
		}
	}

	/** Global Escape key handler */
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
</script>

{#if open}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
		onclick={handleBackdropClick}
		onkeydown={handleBackdropKeydown}
		role="button"
		tabindex="0"
		aria-label="Close settings"
	>
		<!-- Modal -->
		<div
			class="w-full max-w-md rounded-2xl bg-base-100 p-6 shadow-xl"
			role="dialog"
			aria-modal="true"
			aria-labelledby="settings-title"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="flex items-center justify-between">
				<h2 id="settings-title" class="text-xl font-medium text-base-content">Settings</h2>
				<button
					type="button"
					onclick={onClose}
					class="rounded-full p-1 text-base-content/60 transition-colors hover:bg-base-300 hover:text-base-content"
					aria-label="Close settings"
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

			<div class="mt-6 space-y-6">
				<!-- Copy Format Setting -->
				<fieldset class="space-y-3">
					<legend class="text-sm font-medium text-base-content">Copy format</legend>
					<div class="space-y-2">
						<label class="flex cursor-pointer items-center gap-3">
							<input
								type="radio"
								name="copyFormat"
								class="radio radio-primary"
								checked={$settingsStore.copyWithCommas}
								onchange={() => setCopyWithCommas(true)}
							/>
							<span class="text-base-content">With commas (1,234.56)</span>
						</label>
						<label class="flex cursor-pointer items-center gap-3">
							<input
								type="radio"
								name="copyFormat"
								class="radio radio-primary"
								checked={!$settingsStore.copyWithCommas}
								onchange={() => setCopyWithCommas(false)}
							/>
							<span class="text-base-content">Without commas (1234.56)</span>
						</label>
					</div>
				</fieldset>

			</div>

			<div class="mt-8 flex justify-end">
				<button type="button" onclick={onClose} class="btn btn-primary"> Done </button>
			</div>
		</div>
	</div>
{/if}
