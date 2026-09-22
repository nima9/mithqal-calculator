<script lang="ts">
  import { env } from "$env/dynamic/public";
  import { verifyToken } from "$lib/turnstile.remote";
  import { loadTurnstileScript } from "$lib/utils/turnstile";
  import { onMount } from "svelte";

  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet;
    storageKey?: string;
  };

  let { children, storageKey = "about_verified" }: Props = $props();

  const TURNSTILE_SITE_KEY = env.PUBLIC_TURNSTILE_SITE_KEY;

  let isVerified = $state(false);

  let turnstileReady = $state(false);

  let isVerifying = $state(false);

  let error = $state<string | null>(null);

  let canRetry = $state(false);

  let widgetId: string | null = null;

  onMount(() => {
    void (async () => {
      if (sessionStorage.getItem(storageKey) === "true") {
        isVerified = true;

        return;
      }

      if (!TURNSTILE_SITE_KEY) {
        error = "Human verification is not configured.";

        return;
      }

      try {
        await loadTurnstileScript();
        turnstileReady = true;
      } catch {
        error = "Human verification could not load. Please try again.";
        canRetry = true;
      }
    })();
  });

  async function onTurnstileSuccess(token: string) {
    isVerifying = true;
    error = null;
    canRetry = false;

    try {
      const result = await verifyToken({ token });

      if (result.success) {
        sessionStorage.setItem(storageKey, "true");
        isVerified = true;
      } else {
        error = result.error || "Verification failed. Please try again.";
        canRetry = true;
      }
    } catch {
      error = "Something went wrong. Please try again.";
      canRetry = true;
    } finally {
      isVerifying = false;
    }
  }

  function onTurnstileError(errorCode: string) {
    const code = /^\d{3,6}$/.test(errorCode) ? ` (error ${errorCode})` : "";
    error = `Human verification could not run${code}. Please try again or use another browser.`;
    canRetry = true;
  }

  function onTurnstileExpired() {
    error = "Human verification expired. Please try again.";
    canRetry = true;
  }

  function retryTurnstile() {
    error = null;
    canRetry = false;

    if (widgetId) window.turnstile?.reset(widgetId);
  }

  function setupTurnstile(node: HTMLElement) {
    if (!window.turnstile || !TURNSTILE_SITE_KEY) return;

    const renderedWidgetId = window.turnstile.render(node, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: onTurnstileSuccess,
      theme: "auto",
      action: "content_gate",
      retry: "never",
      "error-callback": onTurnstileError,
      "expired-callback": onTurnstileExpired,
      "timeout-callback": onTurnstileExpired,
    });

    widgetId = renderedWidgetId;

    return {
      destroy() {
        window.turnstile?.remove(renderedWidgetId);

        if (widgetId === renderedWidgetId) widgetId = null;
      },
    };
  }
</script>

{#if isVerified}
  {@render children()}
{:else}
  <div class="flex min-h-[60vh] flex-col items-center justify-center p-8 text-base-content">
    <h1 class="text-2xl font-medium">Verify you're human</h1>
    <p class="mt-2 text-base-content/70">Please complete the challenge to view this page.</p>

    <div class="mt-8 flex flex-col items-center gap-4">
      {#if turnstileReady}
        <div use:setupTurnstile></div>
      {:else if !error}
        <p class="text-accent">Loading...</p>
      {/if}
      {#if isVerifying}
        <p class="text-accent">Verifying...</p>
      {/if}

      {#if error}
        <p class="text-error">{error}</p>
      {/if}
      {#if canRetry}
        <button type="button" class="btn btn-sm btn-outline" onclick={retryTurnstile}>
          Try again
        </button>
      {/if}
    </div>
  </div>
{/if}
