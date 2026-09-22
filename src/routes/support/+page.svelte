<!-- Support page with donation links. -->

	<script lang="ts">
		import { trackGoogleEvent } from '$lib/analytics';
		import Coffee from '$lib/components/icons/Coffee.svelte';
	</script>

<div class="mx-auto max-w-2xl px-6 py-8 text-base-content">
		<h1 class="font-karla text-4xl font-medium md:text-5xl">Support</h1>

		<section class="mt-8">
			<p class="text-lg leading-relaxed text-base-content/80">
				The <strong class="text-base-content">Mithqal Calculator</strong> is a free tool built to serve
				the community. If you find it useful and want more projects like this, consider supporting me.
			</p>
		</section>

		<section class="mt-10">
			<h2 class="font-karla text-2xl font-medium md:text-3xl">Ways to Support</h2>

			<div class="mt-6 grid gap-4 sm:grid-cols-2">
				<!-- Ko-fi -->
				<a
					href="https://ko-fi.com/nima999"
					onclick={() => trackGoogleEvent('donation_link_click', { provider: 'ko-fi' })}
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
					onclick={() => trackGoogleEvent('donation_link_click', { provider: 'sticker' })}
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
			</div>
		</section>

		<section class="mt-10 rounded-xl border border-base-300 bg-base-200/30 p-6">
			<h2 class="font-karla text-2xl font-medium md:text-3xl">Have a suggestion? Found a bug?</h2>
			<p class="mt-3 text-base leading-relaxed text-base-content/70">
				You can email me at
				<a
					href="mailto:mithqal@mohajeri.dev"
					onclick={() => trackGoogleEvent('generate_lead', { method: 'support_email' })}
					class="font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary"
				>
					mithqal@mohajeri.dev</a
				>
			</p>
		</section>
</div>
