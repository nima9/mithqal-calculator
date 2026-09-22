// Regions where the site asks for explicit consent before enabling Google
// Analytics or advertising storage. Google uses ISO 3166-2 region codes.
export const GOOGLE_CONSENT_REGIONS = [
  // EU Member States
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
  // Other EEA countries
  "IS",
  "LI",
  "NO",
  // Countries with similar consent requirements
  "GB",
  "CH",
] as const;

export type GoogleConsentValue = boolean | null;

export type GoogleTagFunction = (...args: unknown[]) => void;

type GoogleConsentState = "granted" | "denied";

const GOOGLE_CONSENT_REGION_SET = new Set<string>(GOOGLE_CONSENT_REGIONS);

export function requiresGoogleConsent(country: string): boolean {
  return GOOGLE_CONSENT_REGION_SET.has(country.toUpperCase());
}

function consentParameters(state: GoogleConsentState) {
  return {
    analytics_storage: state,
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
  };
}

export function setGoogleConsentDefaults(gtag: GoogleTagFunction): void {
  gtag("consent", "default", consentParameters("granted"));
  gtag("consent", "default", {
    ...consentParameters("denied"),
    region: GOOGLE_CONSENT_REGIONS,
  });
  gtag("set", "ads_data_redaction", true);
}

export function updateGoogleConsent(gtag: GoogleTagFunction, consent: GoogleConsentValue): void {
  gtag("consent", "update", consentParameters(consent === true ? "granted" : "denied"));
}
