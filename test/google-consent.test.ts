import { describe, expect, test } from "bun:test";
import {
  GOOGLE_CONSENT_REGIONS,
  requiresGoogleConsent,
  setGoogleConsentDefaults,
  updateGoogleConsent,
} from "../src/lib/googleConsent";

describe("Google consent regions", () => {
  test("requires consent throughout the EEA and in the UK and Switzerland", () => {
    for (const country of ["DE", "ES", "NO", "GB", "CH"]) {
      expect(requiresGoogleConsent(country)).toBe(true);
    }
  });

  test("preserves full measurement outside consent regions", () => {
    for (const country of ["US", "CA", "JP", "AU", ""]) {
      expect(requiresGoogleConsent(country)).toBe(false);
    }
  });

  test("contains unique ISO region codes", () => {
    expect(new Set(GOOGLE_CONSENT_REGIONS).size).toBe(GOOGLE_CONSENT_REGIONS.length);
    expect(requiresGoogleConsent("de")).toBe(true);
  });

  test("queues global granted and regional denied defaults before redaction", () => {
    const calls: unknown[][] = [];
    setGoogleConsentDefaults((...args) => calls.push(args));

    expect(calls).toEqual([
      [
        "consent",
        "default",
        {
          analytics_storage: "granted",
          ad_storage: "granted",
          ad_user_data: "granted",
          ad_personalization: "granted",
        },
      ],
      [
        "consent",
        "default",
        {
          analytics_storage: "denied",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
          region: GOOGLE_CONSENT_REGIONS,
        },
      ],
      ["set", "ads_data_redaction", true],
    ]);
  });

  test("updates every Consent Mode v2 field for acceptance and revocation", () => {
    const calls: unknown[][] = [];
    const gtag = (...args: unknown[]) => calls.push(args);

    updateGoogleConsent(gtag, true);
    updateGoogleConsent(gtag, false);

    expect(calls).toEqual([
      [
        "consent",
        "update",
        {
          analytics_storage: "granted",
          ad_storage: "granted",
          ad_user_data: "granted",
          ad_personalization: "granted",
        },
      ],
      [
        "consent",
        "update",
        {
          analytics_storage: "denied",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
        },
      ],
    ]);
  });
});
