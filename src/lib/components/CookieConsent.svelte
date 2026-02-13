<script lang="ts">
	import { hasDecided, acceptConsent, declineConsent } from '$lib/stores/consent.svelte';
	import { fly } from 'svelte/transition';

	interface Props {
		onLearnMore: () => void;
	}

	let { onLearnMore }: Props = $props();
</script>

{#if !$hasDecided}
	<div
		class="fixed bottom-0 left-0 right-0 z-40 border-t border-base-300 bg-base-100/95 backdrop-blur-sm"
		transition:fly={{ y: 100, duration: 300 }}
	>
		<div class="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3">
			<p class="text-sm text-base-content/80">
				We use cookies for analytics and ads.
				<button
					type="button"
					onclick={onLearnMore}
					class="text-primary underline-offset-2 hover:underline"
				>
					Learn more
				</button>
			</p>
			<div class="flex gap-2">
				<button
					type="button"
					onclick={declineConsent}
					class="btn btn-ghost btn-sm"
				>
					Decline
				</button>
				<button
					type="button"
					onclick={acceptConsent}
					class="btn btn-primary btn-sm"
				>
					Accept
				</button>
			</div>
		</div>
	</div>
{/if}
