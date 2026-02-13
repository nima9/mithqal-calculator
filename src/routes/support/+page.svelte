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
	import TurnstileGate from '$lib/components/TurnstileGate.svelte';
	import Coffee from '$lib/components/icons/Coffee.svelte';
	import PayPal from '$lib/components/icons/PayPal.svelte';
</script>

<svelte:head>
	<title>Support - Mithqal Calculator</title>
</svelte:head>

<TurnstileGate storageKey="about_verified">
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
					<PayPal size={40} />
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
</TurnstileGate>
