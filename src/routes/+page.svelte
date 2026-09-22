<!--
	+page.svelte
	Home page - renders the calculator with geo-based default currency and timezone.
	URL parameters (q, m, c) are read client-side via $page.url.searchParams.
-->

<script lang="ts">
  import Calculator from "$lib/components/Calculator.svelte";
  import { localizedUrl } from "$lib/seo";

  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  let structuredData = $derived({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Mithqál Calculator",
    url: localizedUrl("/", data.locale),
    description:
      "Free mithqál calculator: convert mithqals of gold and silver to any currency with live precious metal and exchange rates.",
    inLanguage: data.locale,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  });

  let structuredDataJson = $derived(JSON.stringify(structuredData).replaceAll("<", "\\u003c"));
</script>

<svelte:head>
  {@html '<script type="application/ld+json">' + structuredDataJson + "</" + "script>"}
</svelte:head>

<h1 class="sr-only">Mithqál Calculator</h1>

<Calculator
  selectedCurrency={data.defaultCurrency}
  timezone={data.timezone}
  initialRates={data.initialRates}
  locale={data.locale}
/>
