<!--
	+layout.svelte
	Root layout component that wraps all pages.
	Includes the global header and handles page transitions.
-->

<script lang="ts">
  import "./layout.css";
  import { browser } from "$app/environment";
  import { page } from "$app/state";
  import { env } from "$env/dynamic/public";
  import CookieConsent from "$lib/components/CookieConsent.svelte";
  import CookieModal from "$lib/components/CookieModal.svelte";
  import GoogleAnalytics from "$lib/components/GoogleAnalytics.svelte";
  import Header from "$lib/components/Header.svelte";
  import {
    getDefaultLanguageUrl,
    getLanguageAlternates,
    localizedUrl,
    OPEN_GRAPH_LOCALES,
  } from "$lib/seo";
  import { allowsTracking, consentStore } from "$lib/stores/consent.svelte";
  import { cubicOut } from "svelte/easing";
  import { fly } from "svelte/transition";

  import type { LayoutProps } from "./$types";
  import type { Component } from "svelte";

  let { children, data }: LayoutProps = $props();

  // Cookie modal state
  let cookieModalOpen = $state(false);

  // Dynamically load GoogleAds component to prevent adblockers from breaking the app
  let GoogleAds: Component | null = $state(null);

  let shouldLoadAds = $derived(!data.requiresConsent || $allowsTracking);

  const GA_MEASUREMENT_ID = env.PUBLIC_GA_MEASUREMENT_ID;

  let currentPathname = $derived(page.url.pathname);

  let canonicalUrl = $derived(localizedUrl(currentPathname, data.locale));

  let languageAlternates = $derived(getLanguageAlternates(currentPathname));

  let defaultLanguageUrl = $derived(getDefaultLanguageUrl(currentPathname));

  let openGraphLocale = $derived(OPEN_GRAPH_LOCALES[data.locale]);

  let openGraphAlternates = $derived(
    Object.entries(OPEN_GRAPH_LOCALES)
      .filter(([locale]) => locale !== data.locale)
      .map(([, locale]) => locale),
  );

  const DEFAULT_SEO_TITLE = "Mithqál Calculator – Convert Gold & Silver to Any Currency";

  const SEO_TITLES = new Map<string, string>([
    ["/about", "About - Mithqal Calculator"],
    ["/support", "Support - Mithqal Calculator"],
  ]);

  const DEFAULT_SEO_DESCRIPTION =
    "Free mithqál calculator: convert mithqals of gold and silver to any currency with live precious metal and exchange rates.";

  const SEO_DESCRIPTIONS = new Map<string, string>([
    [
      "/about",
      "About the Mithqal Calculator: a free tool for converting mithqals of gold and silver to any currency, used for Huqúqu'lláh calculations.",
    ],
    [
      "/support",
      "Support the Mithqal Calculator, a free ad-supported tool for converting gold and silver mithqals to any currency.",
    ],
  ]);

  let seoTitle = $derived(SEO_TITLES.get(currentPathname) ?? DEFAULT_SEO_TITLE);

  let seoDescription = $derived(SEO_DESCRIPTIONS.get(currentPathname) ?? DEFAULT_SEO_DESCRIPTION);

  $effect(() => {
    if (!browser || GoogleAds || !shouldLoadAds) return;
    void (async () => {
      try {
        GoogleAds = (await import("$lib/components/GoogleAds.svelte")).default;
      } catch {
        // Silently fail if blocked by adblocker
      }
    })();
  });

  $effect(() => {
    if (browser) document.documentElement.lang = data.locale;
  });
</script>

<svelte:head>
  <title>{seoTitle}</title>
  <meta name="description" content={seoDescription} />
  <link rel="canonical" href={canonicalUrl} />
  {#each languageAlternates as alternate (alternate.hreflang)}
    <link rel="alternate" hreflang={alternate.hreflang} href={alternate.href} />
  {/each}
  <link rel="alternate" hreflang="x-default" href={defaultLanguageUrl} />

  <!-- Open Graph (used by iMessage, WhatsApp, SMS platforms) -->
  <meta property="og:title" content={seoTitle} />
  <meta property="og:description" content={seoDescription} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Mithqal Calculator" />
  <meta property="og:locale" content={openGraphLocale} />
  {#each openGraphAlternates as alternate}
    <meta property="og:locale:alternate" content={alternate} />
  {/each}
  <meta property="og:image" content="https://mithqal.app/og.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Mithqal Calculator - Convert mithqals to currency" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:creator" content="@OhNoNima" />
  <meta name="twitter:image" content="https://mithqal.app/og.png" />
  <meta name="twitter:title" content={seoTitle} />
  <meta name="twitter:description" content={seoDescription} />

  <!-- Other -->
  <meta name="github" content="https://github.com/nima9/mithqal-culator" />
  <link rel="sitemap" href="/sitemap.xml" />
</svelte:head>

<Header onCookiePreferences={data.requiresConsent ? () => (cookieModalOpen = true) : undefined} />

{#if GA_MEASUREMENT_ID}
  <GoogleAnalytics
    measurementId={GA_MEASUREMENT_ID}
    requiresConsent={data.requiresConsent}
    consent={$consentStore}
  />
{/if}

<!-- Keyed block ensures main content remounts when the URL changes so fly transitions re-run -->
{#key page.url.pathname}
  <main
    in:fly={{ y: 20, duration: 300, delay: 300, easing: cubicOut }}
    out:fly={{ y: -20, duration: 300, easing: cubicOut }}
  >
    <!-- Render the active child route's page content -->
    {@render children()}
  </main>
{/key}

<!-- Google AdSense - loaded dynamically to prevent adblockers from breaking the app -->
{#if GoogleAds && shouldLoadAds}
  <GoogleAds />
{/if}

<!-- Cookie consent banner - only shown to EEA/UK/CH users who haven't decided -->
{#if data.requiresConsent}
  <CookieConsent onLearnMore={() => (cookieModalOpen = true)} />
  <CookieModal bind:open={cookieModalOpen} onClose={() => (cookieModalOpen = false)} />
{/if}

<style>
  /* Smooth out fly() page transitions applied to <main> above */
  main {
    transform: translateZ(0);
  }
</style>
