<!--
	about/+page.svelte
	About page with Turnstile verification gate, site explanation, and FAQ accordion.

	Flow:
	1. Check if user is already verified (sessionStorage)
	2. If not verified, show Cloudflare Turnstile challenge
	3. On successful verification, store in sessionStorage and show content
	4. Content includes site description and FAQ accordion (bits-ui)
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { Accordion, Popover } from 'bits-ui';
	import { slide, fly } from 'svelte/transition';
	import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';
	import { loadTurnstileScript } from '$lib/utils/turnstile';
	import { verifyToken } from '$lib/turnstile.remote';

	// ============================================
	// Constants
	// ============================================

	/** SessionStorage key for tracking verification status */
	const VERIFIED_KEY = 'about_verified';

	// ============================================
	// FAQ Data
	// ============================================

	/** FAQ items displayed in the accordion */
	const faqs = [
		{
			id: 'what-is-mithqal',
			question: 'What is a Mithqál?',
			answer:
				"A mithqál is a traditional unit of weight used in the Middle East, equivalent to approximately 3.642 grams. In the Bahá'í Faith, it holds special significance as it is used to calculate Huqúqu'lláh (the Right of God), a spiritual obligation for Bahá'ís to contribute 19% of their surplus wealth after essential expenses (only if the individuals net worth is worth 19 Mithqáls of gold or more)."
		},
		{
			id: 'what-is-bahai',
			question: "What is the Bahá'í Faith?",
			answer:
				"The Bahá'í Faith is a world religion founded by Bahá'u'lláh in 19th-century Persia. It teaches the essential oneness of all religions and the unity of humanity. Bahá'ís believe in progressive revelation—that God has sent a series of divine messengers throughout history, including Abraham, Moses, Buddha, Jesus, Muhammad, and most recently Bahá'u'lláh. For more information, please visit bahai.org"
		},
		{
			id: 'why-ads',
			question: 'Why are there advertisements?',
			answer:
				'Currently, there are no advertisements on this site. The Mithqál Calculator is provided as a free service to the community. If ads are ever introduced, they would be to help cover hosting and maintenance costs while keeping the calculator freely accessible to everyone.'
		},
		{
			id: 'mobile-app',
			question: 'Do you have a mobile app?',
			answer: 'In the works!'
		},
		{
			id: 'rate-sources',
			question: 'Where do the currency and metal rates come from?',
			answer:
				"Gold and silver prices are fetched from Swissquote's forex data feed, which provides real-time market rates. Currency exchange rates come from FXRatesAPI, a reliable foreign exchange rate provider. Rates are updated daily to ensure accuracy."
		}
	];

	// ============================================
	// State
	// ============================================

	// Turnstile verification state
	let isVerified = $state(false);
	let showTurnstile = $state(false);
	let turnstileReady = $state(false);
	let isVerifying = $state(false);
	let error = $state<string | null>(null);

	// Accordion state - tracks which FAQ items are open
	let openItems = $state<string[]>([]);
	let allExpanded = $derived(openItems.length === faqs.length);

	// ============================================
	// Accordion Handlers
	// ============================================

	/** Toggle all FAQ items open or closed */
	function toggleAll() {
		if (allExpanded) {
			openItems = [];
		} else {
			openItems = faqs.map((f) => f.id);
		}
	}

	// ============================================
	// Turnstile Verification
	// ============================================

	/**
	 * On mount, check if user is already verified.
	 * If not, load the Turnstile script and show the challenge.
	 */
	onMount(async () => {
		if (sessionStorage.getItem(VERIFIED_KEY) === 'true') {
			isVerified = true;
		} else {
			showTurnstile = true;
			await loadTurnstileScript();
			turnstileReady = true;
		}
	});

	/**
	 * Callback when Turnstile challenge is completed.
	 * Sends token to server for verification via remote function.
	 * @param token - Turnstile token from successful challenge
	 */
	async function onTurnstileSuccess(token: string) {
		isVerifying = true;
		error = null;

		try {
			const result = await verifyToken({ token });

			if (result.success) {
				// Store verification in sessionStorage (persists until tab closes)
				sessionStorage.setItem(VERIFIED_KEY, 'true');
				isVerified = true;
				showTurnstile = false;
			} else {
				error = result.error || 'Verification failed. Please try again.';
			}
		} catch {
			error = 'Something went wrong. Please try again.';
		} finally {
			isVerifying = false;
		}
	}

	/**
	 * Svelte action to render Turnstile widget.
	 * Automatically cleans up on component destroy.
	 */
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

<svelte:head>
	<title>About - Mithqal Calculator</title>
</svelte:head>

<!-- ============================================ -->
<!-- Verified Content: About page with FAQ       -->
<!-- ============================================ -->
{#if isVerified}
	<div class="mx-auto max-w-2xl px-6 py-8 text-base-content">
		<h1 class="font-karla text-4xl font-medium md:text-5xl">About</h1>

		<!-- Developer Intro -->
		<section class="mt-8">
			<p class="text-lg leading-relaxed text-base-content/80">
				Hi, I'm <strong class="text-base-content">Nima</strong>, a software developer passionate
				about building useful tools for the community.
				<Popover.Root>
					<Popover.Trigger
						class="inline-flex cursor-pointer items-center gap-1 rounded border border-primary/50 px-2 py-0.5 text-primary transition-colors hover:border-primary hover:bg-primary/10"
					>
						Socials
						<span class="text-xs">&#x25BC;</span>
					</Popover.Trigger>
					<Popover.Portal>
						<Popover.Content
							class="z-50 w-48 rounded-lg border border-base-300 bg-base-100 p-2 shadow-lg"
							sideOffset={8}
							transition={fly}
							transitionConfig={{ y: -8, duration: 150 }}
						>
							<div class="flex flex-col gap-1">
								<a
									href="https://github.com/nima9"
									target="_blank"
									rel="noopener noreferrer"
									class="flex items-center gap-2 rounded px-3 py-2 text-sm text-base-content transition-colors hover:bg-base-200"
								>
									GitHub
								</a>
								<a
									href="https://x.com/OhNoNima"
									target="_blank"
									rel="noopener noreferrer"
									class="flex items-center gap-2 rounded px-3 py-2 text-sm text-base-content transition-colors hover:bg-base-200"
								>
									Twitter (X)
								</a>
								<a
									href="https://bsky.app/profile/mohajeri.dev"
									target="_blank"
									rel="noopener noreferrer"
									class="flex items-center gap-2 rounded px-3 py-2 text-sm text-base-content transition-colors hover:bg-base-200"
								>
									Bluesky
								</a>
								<a
									href="https://linkedin.com/in/nima9"
									target="_blank"
									rel="noopener noreferrer"
									class="flex items-center gap-2 rounded px-3 py-2 text-sm text-base-content transition-colors hover:bg-base-200"
								>
									LinkedIn
								</a>
							</div>
						</Popover.Content>
					</Popover.Portal>
				</Popover.Root>
			</p>
		</section>

		<!-- Site Description -->
		<section class="mt-8">
			<p class="text-lg leading-relaxed text-base-content/80">
				The <strong class="text-base-content">Mithqál Calculator</strong> is a free tool designed to
				help calculate the value of gold and silver in mithqáls, the traditional unit of weight used
				for
				<strong class="text-base-content">Huqúqu'lláh</strong> calculations in the Bahá'í Faith.
			</p>
			<p class="mt-4 text-lg leading-relaxed text-base-content/80">
				Simply enter the weight in mithqáls, select your preferred currency, and get an instant
				conversion based on current market rates. The calculator supports over 150 currencies
				worldwide.
			</p>
		</section>

		<!-- FAQ Section with Accordion -->
		<section class="mt-12">
			<h2 class="font-karla text-2xl font-medium md:text-3xl">Frequently Asked Questions</h2>

			<!-- Expand/Collapse All Button -->
			<button
				type="button"
				onclick={toggleAll}
				class="mt-4 rounded border border-base-300 px-3 py-1.5 text-sm font-medium text-base-content/70 transition-colors hover:border-primary hover:text-primary"
			>
				{allExpanded ? 'Collapse all' : 'Expand all'}
			</button>

			<!-- FAQ Accordion (bits-ui) -->
			<Accordion.Root type="multiple" bind:value={openItems} class="mt-4 space-y-2">
				{#each faqs as faq (faq.id)}
					{@const isOpen = openItems.includes(faq.id)}
					<Accordion.Item value={faq.id} class="border-b border-base-300">
						<Accordion.Header>
							<Accordion.Trigger
								class="flex w-full items-center justify-between py-4 text-left font-karla text-lg font-medium transition-colors hover:text-primary"
							>
								<span>{faq.question}</span>
								<!-- Plus icon that rotates 45° to become X when open -->
								<span
									class="ml-4 text-2xl transition-transform duration-200 {isOpen
										? 'rotate-45'
										: ''}"
								>
									+
								</span>
							</Accordion.Trigger>
						</Accordion.Header>
						{#if isOpen}
							<Accordion.Content forceMount>
								<div transition:slide={{ duration: 200 }} class="pb-4 text-base-content/70">
									{faq.answer}
								</div>
							</Accordion.Content>
						{/if}
					</Accordion.Item>
				{/each}
			</Accordion.Root>
		</section>
	</div>

	<!-- ============================================ -->
	<!-- Unverified: Turnstile Challenge             -->
	<!-- ============================================ -->
{:else}
	<div class="flex min-h-[60vh] flex-col items-center justify-center p-8 text-base-content">
		<h1 class="text-2xl font-medium">Verify you're human</h1>
		<p class="mt-2 text-base-content/70">Please complete the challenge to view this page.</p>

		<div class="mt-8 flex flex-col items-center gap-4">
			{#if isVerifying}
				<p class="text-accent">Verifying...</p>
			{:else if turnstileReady && showTurnstile}
				<!-- Turnstile widget renders here via Svelte action -->
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
