<!--
	about/+page.svelte
	Public, crawlable site explanation and FAQ accordion.
-->

<script lang="ts">
  import { Accordion, Popover } from "bits-ui";
  import { slide, fly } from "svelte/transition";
  import { trackGoogleEvent } from "$lib/analytics";

  // ============================================
  // FAQ Data
  // ============================================

  /** FAQ items displayed in the accordion */
  const faqs = [
    {
      id: "what-is-mithqal",
      question: "What is a Mithqál?",
      answer:
        "A mithqál is a traditional unit of weight used in the Middle East, equivalent to approximately 3.642 grams. In the Bahá'í Faith, it holds special significance as it is used to calculate Huqúqu'lláh (the Right of God), a spiritual obligation for Bahá'ís to contribute 19% of their surplus wealth after essential expenses (only if the individuals net worth is worth 19 Mithqáls of gold or more).",
    },
    {
      id: "what-is-bahai",
      question: "What is the Bahá'í Faith?",
    },
    {
      id: "why-ads",
      question: "Why are there advertisements?",
      answer: "Advertisements help pay for the fees for running this website.",
    },
    {
      id: "mobile-app",
      question: "Do you have a mobile app?",
      answer: "In the works!",
    },
    {
      id: "rate-sources",
      question: "Where do the currency and metal rates come from?",
      answer:
        "Gold and silver prices are fetched daily from Swissquote's forex data feed. For each metal, the calculator takes the midpoint of every valid bid/ask quote and uses the median of those midpoints. Currency exchange rates come from FXRatesAPI. The displayed timestamp shows when the latest complete snapshot was successfully retrieved.",
    },
  ];

  // ============================================
  // State
  // ============================================

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
</script>

<div class="mx-auto max-w-2xl px-6 py-8 text-base-content">
  <h1 class="font-karla text-4xl font-medium md:text-5xl">About</h1>

  <!-- Developer Intro -->
  <section class="mt-8">
    <p class="text-lg leading-relaxed text-base-content/80">
      Hi, I'm <strong class="text-base-content">Nima</strong>, a software
      developer passionate about building useful tools for the community.
    </p>
    <div class="mt-4">
      <Popover.Root>
        <Popover.Trigger
          class="inline-flex cursor-pointer items-center gap-1 rounded border border-primary/50 px-2 py-0.5 text-primary transition-colors hover:border-primary hover:bg-primary/10"
        >
          Socials
          <span class="text-xs">&#x25BC;</span>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            class="z-50 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-base-300 bg-base-100 p-2 shadow-lg"
            sideOffset={8}
            onFocusOutside={(event) => event.preventDefault()}
            onInteractOutside={(event) => event.preventDefault()}
          >
            <div class="flex flex-col gap-1" in:fly={{ y: -8, duration: 150 }}>
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
              <a
                href="mailto:mithqal@mohajeri.dev"
                onclick={() =>
                  trackGoogleEvent("generate_lead", { method: "social_email" })}
                class="flex items-center gap-2 rounded px-3 py-2 text-sm text-base-content transition-colors hover:bg-base-200"
              >
                Email
              </a>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  </section>

  <!-- Site Description -->
  <section class="mt-8">
    <p class="text-lg leading-relaxed text-base-content/80">
      The <strong class="text-base-content">Mithqál Calculator</strong> is a
      free tool designed to help calculate the value of gold and silver in
      mithqáls, the traditional unit of weight used for
      <strong class="text-base-content">Huqúqu'lláh</strong> calculations in the
      Bahá'í Faith.
    </p>
    <p class="mt-4 text-lg leading-relaxed text-base-content/80">
      Simply enter the weight in mithqáls, select your preferred currency, and
      get an instant conversion based on current market rates. The calculator
      supports over 150 currencies worldwide.
    </p>
    <p class="mt-4 text-lg leading-relaxed text-base-content/80">
      I am working on a website to showcase all the great Bahai tools people
      have made online. The domain of the site is bahaitools.app!
    </p>
  </section>

  <!-- FAQ Section with Accordion -->
  <section class="mt-12">
    <h2 class="font-karla text-2xl font-medium md:text-3xl">
      Frequently Asked Questions
    </h2>

    <!-- Expand/Collapse All Button -->
    <button
      type="button"
      onclick={toggleAll}
      class="mt-4 rounded border border-base-300 px-3 py-1.5 text-sm font-medium text-base-content/70 transition-colors hover:border-primary hover:text-primary"
    >
      {allExpanded ? "Collapse all" : "Expand all"}
    </button>

    <!-- FAQ Accordion (bits-ui) -->
    <Accordion.Root
      type="multiple"
      bind:value={openItems}
      class="mt-4 space-y-2"
    >
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
              <div
                data-prose
                transition:slide={{ duration: 200 }}
                class="pb-4 text-base-content/70"
              >
                {#if faq.id === "what-is-bahai"}
                  The Bahá'í Faith is a world religion founded by Bahá'u'lláh in
                  19th-century Persia. It teaches the essential oneness of all
                  religions and the unity of humanity. Bahá'ís believe in
                  progressive revelation, meaning that God has sent a series of
                  divine messengers throughout history, including Abraham,
                  Moses, Buddha, Jesus, Muhammad, and most recently Bahá'u'lláh.
                  For more information, please visit
                  <a
                    href="https://www.bahai.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary"
                    >bahai.org</a
                  >.
                {:else}
                  {faq.answer}
                {/if}
              </div>
            </Accordion.Content>
          {/if}
        </Accordion.Item>
      {/each}
    </Accordion.Root>
  </section>
</div>
