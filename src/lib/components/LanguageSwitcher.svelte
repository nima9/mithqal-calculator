<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { getLocale, LANGUAGE_OPTIONS } from "$lib/i18n";

  type Props = {
    class?: string;
    variant?: "header" | "menu";
  };

  let { class: className = "", variant = "header" }: Props = $props();

  let locale = $derived(getLocale(page.url.searchParams.get("lang")));

  let selectedLanguage = $derived(
    LANGUAGE_OPTIONS.find((language) => language.value === locale) ?? LANGUAGE_OPTIONS[0],
  );

  async function changeLanguage(event: Event & { currentTarget: HTMLSelectElement }) {
    const nextLocale = getLocale(event.currentTarget.value);
    const nextUrl = new URL(page.url);

    if (nextLocale === "en") {
      nextUrl.searchParams.delete("lang");
    } else {
      nextUrl.searchParams.set("lang", nextLocale);
    }

    await goto(`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`, {
      keepFocus: true,
      noScroll: true,
    });
  }
</script>

<label
  class="language-switcher relative inline-flex items-center justify-center font-karla font-medium {className}"
  class:language-switcher-header={variant === "header"}
  class:language-switcher-menu={variant === "menu"}
>
  <span class="sr-only">Language</span>
  <span
    aria-hidden="true"
    class="invisible py-1 pr-1 pl-6 font-karla font-medium whitespace-pre {variant === 'header'
      ? 'text-xl'
      : 'text-lg'}"
  >
    {selectedLanguage.label}
  </span>
  <select
    value={locale}
    onchange={changeLanguage}
    class="absolute inset-0 z-10 h-full w-full min-w-0 cursor-pointer appearance-none bg-transparent py-1 pr-1 pl-6 font-karla font-medium text-base-content outline-hidden focus-visible:ring-2 focus-visible:ring-primary {variant ===
    'header'
      ? 'text-xl'
      : 'text-lg'}"
    aria-label="Language"
  >
    {#each LANGUAGE_OPTIONS as language (language.value)}
      <option value={language.value}>{language.label}</option>
    {/each}
  </select>
  <span class="pointer-events-none absolute left-1 z-20 text-xs text-base-content/70">▼</span>
</label>

<style>
  .language-switcher-header {
    height: 2.75rem;
    background-image:
      linear-gradient(transparent, transparent), linear-gradient(var(--primary), var(--primary));
    background-position: 0 100%;
    background-repeat: no-repeat;
    background-size: 0 4px;
    transition: background-size 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .language-switcher-header:hover,
  .language-switcher-header:focus-within {
    background-size: 100% 4px;
  }

  .language-switcher-menu {
    min-height: 2.75rem;
  }
</style>
