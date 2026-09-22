export type GoogleEventParameters = Record<string, string | number | boolean | undefined>;

export function trackGoogleEvent(name: string, parameters: GoogleEventParameters = {}) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, parameters);
}
