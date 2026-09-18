/**
 * turnstile.ts
 * Shared Turnstile verification utilities.
 * Uses Effect for never-throw, errors-as-values handling.
 * Used by: turnstile.remote.ts
 */

import { Effect, Either } from "effect";

/** Cloudflare Turnstile server-side verification endpoint */
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let turnstileScriptPromise: Promise<void> | null = null;

// ============================================
// Error Types
// ============================================

export type TurnstileErrorKind = "NETWORK_ERROR" | "VERIFICATION_FAILED" | "INVALID_RESPONSE";

export interface TurnstileError {
  kind: TurnstileErrorKind;
  message: string;
}

// ============================================
// Verification Function
// ============================================

/**
 * Verify a Turnstile token with Cloudflare's API.
 * Validates the token, action, and hostname through Cloudflare Siteverify.
 */
function verifyTurnstileTokenEffect(input: {
  token: string;
  secretKey: string;
  expectedAction: string;
  allowedHostnames: ReadonlySet<string>;
  remoteIp?: string;
  allowTestResponse?: boolean;
}): Effect.Effect<true, TurnstileError> {
  const {
    token,
    secretKey,
    expectedAction,
    allowedHostnames,
    remoteIp,
    allowTestResponse = false,
  } = input;

  return Effect.gen(function* () {
    if (token.length === 0 || token.length > 2048 || allowedHostnames.size === 0) {
      return yield* Effect.fail<TurnstileError>({
        kind: "VERIFICATION_FAILED",
        message: "Turnstile verification failed",
      });
    }

    const formData = new FormData();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (remoteIp) formData.append("remoteip", remoteIp);

    const response = yield* Effect.tryPromise({
      try: () =>
        fetch(TURNSTILE_VERIFY_URL, {
          method: "POST",
          body: formData,
          signal: AbortSignal.timeout(10_000),
        }),
      catch: (): TurnstileError => ({
        kind: "NETWORK_ERROR",
        message: "Failed to connect to Turnstile verification service",
      }),
    });

    if (!response.ok) {
      return yield* Effect.fail<TurnstileError>({
        kind: "INVALID_RESPONSE",
        message: "Turnstile verification service returned an error",
      });
    }

    const outcome: unknown = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: (): TurnstileError => ({
        kind: "INVALID_RESPONSE",
        message: "Failed to parse Turnstile response",
      }),
    });

    const result = outcome as { success?: boolean; action?: string; hostname?: string };
    if (
      result.success === true &&
      (allowTestResponse ||
        (result.action === expectedAction &&
          typeof result.hostname === "string" &&
          allowedHostnames.has(result.hostname)))
    ) {
      return true as const;
    }

    return yield* Effect.fail<TurnstileError>({
      kind: "VERIFICATION_FAILED",
      message: "Turnstile verification failed",
    });
  });
}

/**
 * Run the verification effect and return its outcome as a value.
 * Never throws: failures are reported as `Either.left`.
 */
export async function verifyTurnstileToken(input: {
  token: string;
  secretKey: string;
  expectedAction: string;
  allowedHostnames: ReadonlySet<string>;
  remoteIp?: string;
  allowTestResponse?: boolean;
}): Promise<Either.Either<true, TurnstileError>> {
  return Effect.runPromise(Effect.either(verifyTurnstileTokenEffect(input)));
}

/**
 * Load the Turnstile script dynamically.
 * Call this when user initiates an action requiring verification.
 * @returns Promise that resolves when script is loaded
 */
export function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Turnstile can only load in a browser"));
  }

  if (window.turnstile) return Promise.resolve();
  if (turnstileScriptPromise) return turnstileScriptPromise;

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]',
    );
    const script = existingScript ?? document.createElement("script");

    const handleLoad = () => {
      cleanup();
      if (window.turnstile) {
        resolve();
        return;
      }

      script.remove();
      turnstileScriptPromise = null;
      reject(new Error("Turnstile loaded without exposing its browser API"));
    };
    const handleError = () => {
      cleanup();
      script.remove();
      turnstileScriptPromise = null;
      reject(new Error("Failed to load Turnstile"));
    };
    const cleanup = () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (!existingScript) {
      script.src = TURNSTILE_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });

  return turnstileScriptPromise;
}
