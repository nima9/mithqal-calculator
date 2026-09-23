<!--
	Calculator.svelte
	Main calculator component for converting mithqals of gold/silver to currency values.
	Loads rates from the streamed page data and caches them in localStorage for performance.
	Supports URL parameters for shareable state (q=quantity, m=metal, c=currency).

	Flow:
	1. Load cached rates from localStorage (if available)
	2. Use the streamed server Turso snapshot when it is newer
	3. Cache new data in localStorage for future visits
	4. Calculate: mithqals × troy_oz_per_mithqal × metal_price × currency_rate
	5. Sync calculator state with URL parameters (debounced)
-->

<script lang="ts">
  import { browser } from "$app/environment";
  import { replaceState } from "$app/navigation";
  import { page } from "$app/state";
  import { MITHQAL_IN_TROY_OZ, calculateMithqalValue, parsePositiveDecimal } from "$lib/calculator";
  import { getLocalizedCurrencyName } from "$lib/currencyNames";
  import { getLocale } from "$lib/i18n";
  import { getSentenceLanguage } from "$lib/sentences";
  import { settingsStore } from "$lib/stores/settings.svelte";
  import { onMount } from "svelte";
  import CurrencyCombobox from "./Combobox.svelte";
  import RatesTimestamp from "./RatesTimestamp.svelte";
  import Sentence from "./Sentence.svelte";

  // ============================================
  // Constants
  // ============================================

  const CACHE_KEY = "mithqal_rates_cache";

  const CACHE_TTL_MS = 12 * 60 * 60 * 1000 + 5 * 60 * 1000;

  const URL_UPDATE_DEBOUNCE_MS = 300;

  // Default values for URL param comparison
  const DEFAULT_QUANTITY = "19";

  const DEFAULT_METAL = "gold";

  const DEFAULT_CURRENCY_CODE = "USD";

  const VALID_METALS = ["gold", "silver"];

  // ============================================
  // Types
  // ============================================

  type CachedMetal = {
    name: string;
    priceUSD: number;
  };

  type CachedCurrency = {
    code: string;
    name: string;
    symbol: string;
    kind?: "fiat" | "crypto";
    rateToUSD: number;
  };

  type CacheData = {
    lastFetchTime: number;
    metals: CachedMetal[];
    currencies: CachedCurrency[];
  };

  type RatesSnapshot = {
    lastFetchTime: number | null;
    metals: CachedMetal[];
    currencies: CachedCurrency[];
  };

  // ============================================
  // Props
  // ============================================

  type Props = {
    selectedCurrency?: string;
    timezone?: string;
    initialRates?: Promise<RatesSnapshot | null> | null;
    locale?: string;
  };

  let {
    selectedCurrency = $bindable("$ USD"),
    timezone = "America/Los_Angeles",
    initialRates = null,
    locale = "en",
  }: Props = $props();

  // ============================================
  // State
  // ============================================

  // User inputs (initialized from URL params)
  let mithqalAmount = $state(DEFAULT_QUANTITY);

  let selectedMetal = $state(DEFAULT_METAL);

  let copyTooltipState = $state<"idle" | "copied" | "failed">("idle");

  const COPY_TOOLTIP_TEXT = {
    idle: "Click to copy",
    copied: "Copied!",
    failed: "Failed to copy",
  } satisfies Record<"idle" | "copied" | "failed", string>;

  let copyTooltipText = $derived(COPY_TOOLTIP_TEXT[copyTooltipState]);

  // URL sync state
  let urlUpdateTimeout: ReturnType<typeof setTimeout> | null = null;

  let isInitialized = $state(false);

  // Cache state
  let cachedMetals = $state<CachedMetal[]>([]);

  let cachedCurrencies = $state<CachedCurrency[]>([]);

  let cachedLastFetch = $state<number>(0);

  // ============================================
  // Cache Management
  // ============================================

  function isCacheStale(lastFetchTime: number): boolean {
    if (!lastFetchTime) return true;

    return Date.now() - lastFetchTime > CACHE_TTL_MS;
  }

  function parseQuantityParam(q: string | null): string {
    if (!q) return DEFAULT_QUANTITY;

    return parsePositiveDecimal(q) !== null ? q : DEFAULT_QUANTITY;
  }

  function parseMetalParam(m: string | null): string {
    if (!m) return DEFAULT_METAL;
    const normalized = m.toLowerCase();

    return VALID_METALS.includes(normalized) ? normalized : DEFAULT_METAL;
  }

  function applyCurrencyCodeFromUrl(currencyCode: string | null): boolean {
    if (!currencyCode || cachedCurrencies.length === 0) return false;
    const currency = cachedCurrencies.find((c) => c.code === currencyCode);

    if (!currency) return false;
    selectedCurrency = [currency.symbol, currency.code].filter(Boolean).join(" ");

    return true;
  }

  function ensureSelectedCurrencyAvailable() {
    if (cachedCurrencies.length === 0) return;
    const selectedCode = selectedCurrency.slice(-3).toUpperCase().trim();

    if (cachedCurrencies.some((currency) => currency.code === selectedCode)) return;

    const fallback =
      cachedCurrencies.find((currency) => currency.code === DEFAULT_CURRENCY_CODE) ??
      cachedCurrencies[0];

    selectedCurrency = [fallback.symbol, fallback.code].filter(Boolean).join(" ");
  }

  function applyRatesSnapshot(snapshot: RatesSnapshot, persistToCache: boolean) {
    if (
      !snapshot.lastFetchTime ||
      snapshot.metals.length === 0 ||
      snapshot.currencies.length === 0
    ) {
      return;
    }

    const normalizedCurrencies = snapshot.currencies.map((currency) => ({
      ...currency,
      kind: currency.kind ?? (currency.code === "BTC" ? "crypto" : "fiat"),
    }));

    cachedMetals = snapshot.metals;
    cachedCurrencies = normalizedCurrencies;
    cachedLastFetch = snapshot.lastFetchTime;
    ensureSelectedCurrencyAvailable();

    if (persistToCache) {
      const cacheData: CacheData = {
        lastFetchTime: snapshot.lastFetchTime,
        metals: snapshot.metals,
        currencies: normalizedCurrencies,
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    }
  }

  // Load cached data and initialize state on mount
  onMount(() => {
    void (async () => {
      const initialSearchParams = new URLSearchParams(window.location.search);
      const initialQuantity = parseQuantityParam(initialSearchParams.get("q"));
      const initialMetal = parseMetalParam(initialSearchParams.get("m"));
      const initialCurrencyCode = initialSearchParams.get("c")?.toUpperCase() ?? null;

      const cached = localStorage.getItem(CACHE_KEY);

      if (cached) {
        try {
          const data: CacheData = JSON.parse(cached);
          cachedMetals = data.metals || [];
          cachedCurrencies = (data.currencies || []).map((currency) => ({
            ...currency,
            kind: currency.kind ?? (currency.code === "BTC" ? "crypto" : "fiat"),
          }));
          cachedLastFetch = data.lastFetchTime || 0;
        } catch {
          // Invalid cache, will fetch fresh data
        }
      }

      // Initialize state from URL params
      mithqalAmount = initialQuantity;
      selectedMetal = initialMetal;

      const hasValidCache =
        cachedMetals.length > 0 && cachedCurrencies.length > 0 && !isCacheStale(cachedLastFetch);

      if (hasValidCache) {
        // Show cached data immediately without waiting for the server snapshot
        // (it streams in separately and may still be in flight).
        if (!applyCurrencyCodeFromUrl(initialCurrencyCode)) ensureSelectedCurrencyAvailable();
        isInitialized = true;

        // Merge the server snapshot in the background when it arrives, in case
        // it is newer than the local cache. The noop catch keeps a failed
        // stream from surfacing as an unhandled rejection.
        if (initialRates) {
          void initialRates
            .then((snapshot) => {
              if (snapshot?.lastFetchTime && snapshot.lastFetchTime > cachedLastFetch) {
                applyRatesSnapshot(snapshot, true);
              }
            })
            .catch(() => {});
        }

        return;
      }

      // No usable cache: wait for the streamed server snapshot before first paint
      // of the data.
      let serverSnapshot: RatesSnapshot | null = null;

      if (initialRates) {
        try {
          serverSnapshot = await initialRates;
        } catch {
          // Keep the calculator empty if the streamed snapshot is unavailable.
        }
      }

      if (serverSnapshot) {
        applyRatesSnapshot(serverSnapshot, true);
      }

      // Apply URL currency after rates are available, before URL sync starts.
      if (!applyCurrencyCodeFromUrl(initialCurrencyCode)) ensureSelectedCurrencyAvailable();

      isInitialized = true;
    })();

    return () => {
      // Cleanup debounce timeout on unmount
      if (urlUpdateTimeout) {
        clearTimeout(urlUpdateTimeout);
      }
    };
  });

  // Sync calculator state to URL (debounced)
  $effect(() => {
    // Only sync after initialization to avoid updating URL on initial load
    if (!isInitialized) return;

    // Track these values to trigger effect on change
    const quantity = mithqalAmount;
    const metal = selectedMetal;
    const currencyCode = selectedCurrency.slice(-3).toUpperCase().trim();
    const newUrl = buildUrlParams(quantity, metal, currencyCode);
    const currentUrl = `${page.url.pathname}${page.url.search}`;

    // No-op when URL is already in sync.
    if (currentUrl === newUrl) {
      if (urlUpdateTimeout) {
        clearTimeout(urlUpdateTimeout);
        urlUpdateTimeout = null;
      }

      return;
    }

    // Clear existing timeout
    if (urlUpdateTimeout) {
      clearTimeout(urlUpdateTimeout);
    }

    // Debounce URL updates
    urlUpdateTimeout = setTimeout(() => {
      updateUrlParams(quantity, metal, currencyCode);
    }, URL_UPDATE_DEBOUNCE_MS);
  });

  // ============================================
  // URL Param Sync
  // ============================================

  /**
   * Update URL with current calculator state.
   * Only adds params when values differ from defaults.
   */
  function buildUrlParams(
    quantity: string,
    metal: string,
    currencyCode: string,
  ): "/" | `/?${string}` {
    const params = new URLSearchParams();
    const locale = getLocale(page.url.searchParams.get("lang"));

    if (locale !== "en") params.set("lang", locale);

    const normalizedCurrencyCode = /^[A-Z]{3}$/.test(currencyCode)
      ? currencyCode
      : DEFAULT_CURRENCY_CODE;

    // Only add params when different from defaults
    if (quantity !== DEFAULT_QUANTITY) {
      params.set("q", quantity);
    }

    if (metal !== DEFAULT_METAL) {
      params.set("m", metal);
    }

    // Always include currency so shared URLs preserve explicit currency choice.
    params.set("c", normalizedCurrencyCode);

    const paramString = params.toString();

    return paramString ? `/?${paramString}` : "/";
  }

  function updateUrlParams(quantity: string, metal: string, currencyCode: string) {
    const newUrl = buildUrlParams(quantity, metal, currencyCode);

    const currentUrl = `${page.url.pathname}${page.url.search}`;

    if (currentUrl === newUrl) return;

    // Replace URL state without triggering route navigation work.
    replaceState(newUrl, page.state);
  }

  // ============================================
  // Derived Values
  // ============================================

  let displayMetals = $derived(cachedMetals);

  let displayCurrencies = $derived(cachedCurrencies);

  let displayLastFetch = $derived(cachedLastFetch);

  // Lookup maps for fast access
  let currencyMap = $derived.by(() => {
    if (!displayCurrencies.length) {
      return new Map<string, { symbol: string; rateToUSD: number; name: string }>();
    }

    return new Map(
      displayCurrencies.map((c) => [
        c.code,
        { symbol: c.symbol, rateToUSD: c.rateToUSD, name: c.name },
      ]),
    );
  });

  let metalMap = $derived.by(() => {
    if (!displayMetals.length) return new Map<string, number>();

    return new Map(displayMetals.map((m) => [m.name, m.priceUSD]));
  });

  // Format currency data for the combobox component
  let currencyJson = $derived.by(() => {
    if (!displayCurrencies.length) return {};

    return Object.fromEntries(
      displayCurrencies.map((c) => [
        c.code,
        {
          code: c.code,
          name: getLocalizedCurrencyName(c.code, locale, c.name),
          symbol_native: c.symbol,
          kind: c.kind ?? (c.code === "BTC" ? "crypto" : "fiat"),
        },
      ]),
    );
  });

  // ============================================
  // Calculation
  // ============================================

  let calculatedValue = $derived.by(() => {
    const currencyCode = selectedCurrency.slice(-3).toUpperCase().trim();
    const metalName = selectedMetal.toLowerCase().trim();

    const metalPrice = metalMap.get(metalName);
    const currencyRateToUsd = currencyMap.get(currencyCode)?.rateToUSD;
    const quantity = parsePositiveDecimal(mithqalAmount);

    if (metalPrice === undefined || currencyRateToUsd === undefined || quantity === null) {
      return null;
    }

    return calculateMithqalValue({ quantity, metalPriceUsd: metalPrice, currencyRateToUsd });
  });

  let formattedCalculatedValue = $derived.by(() => {
    if (calculatedValue === null) return "";
    const fixed = calculatedValue.toFixed(2);
    const withCommas = fixed.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Remove .00 for whole numbers
    return withCommas.endsWith(".00") ? withCommas.slice(0, -3) : withCommas;
  });

  let displayCalculatedValue = $derived.by(() => {
    if (calculatedValue === null) return "";

    const currencyCode = selectedCurrency.slice(-3).toUpperCase().trim();
    const currencySymbol = currencyMap.get(currencyCode)?.symbol ?? "$";

    return `${currencySymbol} ${formattedCalculatedValue}`;
  });

  // ============================================
  // Sentence (i18n)
  // ============================================

  // Word order, direction, and unit labels come from the language registry
  // so new languages only need a data entry in $lib/sentences.
  let sentenceLanguage = $derived(getSentenceLanguage(locale));

  // ============================================
  // Display Helpers
  // ============================================

  let mithqalLabel = $derived(
    (parsePositiveDecimal(mithqalAmount) ?? 0) > 1
      ? sentenceLanguage.mithqalUnit.plural
      : sentenceLanguage.mithqalUnit.singular,
  );

  let mithqalDefinition = $derived.by(() => {
    if ($settingsStore.weightUnit === "grams") return sentenceLanguage.mithqalDefinition;

    const ounces = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(MITHQAL_IN_TROY_OZ);

    return sentenceLanguage.mithqalDefinitionOunces.replace("{value}", ounces);
  });

  /** Font size class - large by default, smaller only for long values on mobile */
  let resultSizeClass = $derived.by(() => {
    const len = displayCalculatedValue.length;

    if (len > 18) return "text-5xl sm:text-6xl md:text-7xl lg:text-8xl";

    return "text-6xl sm:text-7xl md:text-8xl lg:text-9xl";
  });

  // ============================================
  // Event Handlers
  // ============================================

  /** Sanitize input to only allow numbers and one decimal point */
  function sanitizeInput(event: Event) {
    if (!(event.currentTarget instanceof HTMLInputElement)) return;

    const target = event.currentTarget;
    const validValue = target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");

    if (target.value !== validValue) {
      mithqalAmount = validValue;
    }
  }

  /** Handle input changes and resize field to fit content */
  function handleInput(event: Event) {
    sanitizeInput(event);

    if (!(event.currentTarget instanceof HTMLInputElement)) return;

    event.currentTarget.style.width = `${event.currentTarget.value.length + 1}ch`;
  }

  /** Toggle between Gold and Silver */
  function switchSelectedMetal() {
    selectedMetal = selectedMetal === "gold" ? "silver" : "gold";
  }

  /** Copy calculated value to clipboard (respects comma setting) */
  async function handleCopyClick() {
    if (!formattedCalculatedValue) return;

    try {
      const valueToCopy = $settingsStore.copyWithCommas
        ? formattedCalculatedValue
        : formattedCalculatedValue.replace(/,/g, "");

      await navigator.clipboard.writeText(valueToCopy);
      copyTooltipState = "copied";
    } catch {
      copyTooltipState = "failed";
    }
  }

  /** Reset tooltip text after mouse leaves */
  function handleCopyMouseLeave() {
    setTimeout(() => {
      copyTooltipState = "idle";
    }, 300);
  }
</script>

{#snippet amount()}
  <input
    autocomplete="off"
    type="text"
    id="mithqalAmount"
    name="mithqalAmount"
    bind:value={mithqalAmount}
    oninput={handleInput}
    class="input-underline mb-1 w-14 cursor-text appearance-none bg-base-100 pb-1 text-center text-base-content outline-hidden sm:w-14 md:w-20 md:pb-2 lg:w-24"
  />
{/snippet}

{#snippet mithqalLabelSnippet()}
  <label
    for="mithqalAmount"
    class="tooltip tooltip-top ps-4 font-medium text-base-content"
    data-tip={mithqalDefinition}
  >
    {mithqalLabel}
  </label>
{/snippet}

{#snippet metal()}
  <button
    type="button"
    onclick={switchSelectedMetal}
    class="input-underline mb-1 cursor-pointer appearance-none bg-base-100 px-4 pb-1 text-center text-base-content outline-hidden md:pb-3 lg:pb-3"
  >
    {selectedMetal === "gold" ? "Gold" : "Silver"}
  </button>
{/snippet}

{#snippet currency()}
  <CurrencyCombobox currJson={currencyJson} bind:selectedValue={selectedCurrency} />
{/snippet}

<!-- Calculator Input Row -->
<Sentence
  language={sentenceLanguage}
  snippets={{
    amount,
    mithqalLabel: mithqalLabelSnippet,
    metal,
    currency,
  }}
/>

<br />

<!-- Calculated Result -->
<div class="flex w-full items-center justify-center overflow-hidden pt-16 pb-9">
  <button
    class="tooltip tooltip-bottom text-center text-secondary hover:bg-transparent {resultSizeClass}"
    data-tip={copyTooltipText}
    onclick={handleCopyClick}
    onmouseleave={handleCopyMouseLeave}
    disabled={!displayCalculatedValue}
  >
    {displayCalculatedValue || "..."}
  </button>
</div>

<RatesTimestamp lastFetchTime={displayLastFetch} {timezone} {locale} />
