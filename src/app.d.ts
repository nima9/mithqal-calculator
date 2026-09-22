// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    interface Platform {
      env?: {
        TURNSTILE_SECRET_KEY?: string;
        TURNSTILE_HOSTNAMES?: string;
        CONTACT_EMAIL?: string;
        PUBLIC_GA_MEASUREMENT_ID?: string;
        PUBLIC_TURNSTILE_SITE_KEY?: string;
        TURSO_DATABASE_URL?: string;
        TURSO_AUTH_TOKEN?: string;
      };
      context?: {
        waitUntil(promise: Promise<unknown>): void;
      };
      caches?: CacheStorage & { default: Cache };
    }
  }

  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          theme?: "light" | "dark" | "auto";
          action?: string;
          retry?: "auto" | "never";
          "error-callback"?: (errorCode: string) => void;
          "expired-callback"?: () => void;
          "timeout-callback"?: () => void;
        },
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

export {};
