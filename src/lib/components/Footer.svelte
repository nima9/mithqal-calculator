<!-- Site footer with a sponsor callout and Turnstile-protected contact email. -->
<script lang="ts">
	import ContactEmail from './ContactEmail.svelte';
</script>

<footer class="mt-12 pb-8 text-center">
	<div class="px-4 text-neutral-content/60 sm:px-0">
		<div
			class="mx-auto mt-4 max-w-xs rounded-xl border-2 border-dashed border-secondary/50 bg-base-200/20 px-4 py-3 sm:max-w-xl sm:rounded-2xl sm:px-6 sm:py-5"
		>
			<p class="text-base font-medium text-secondary sm:text-lg">Special Sponsor</p>
			<p class="mt-1 text-xs sm:mt-2 sm:text-sm">
				We're looking for sponsors to keep this project alive and perhaps ad-free
			</p>
			<ContactEmail />
		</div>
	</div>
</footer>
