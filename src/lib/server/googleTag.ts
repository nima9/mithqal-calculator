import { setGoogleConsentDefaults, updateGoogleConsent } from "../googleConsent";

// Render the tag in the original HTML so it does not depend on hydration.
export function renderGoogleTag(
  measurementId: string | undefined,
  requiresConsent: boolean,
): string {
  if (!measurementId || !/^G-[A-Z0-9]+$/.test(measurementId)) return "";

  const defaults: unknown[][] = [];
  setGoogleConsentDefaults((...args) => defaults.push(args));
  const granted: unknown[][] = [];
  const denied: unknown[][] = [];
  updateGoogleConsent((...args) => granted.push(args), true);
  updateGoogleConsent((...args) => denied.push(args), false);
  const command = (args: unknown[]) => `gtag(${args.map((arg) => JSON.stringify(arg)).join(",")});`;

  return `<!-- Google tag (gtag.js) -->
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
${defaults.map(command).join("\n")}
${
  requiresConsent
    ? `try {
  var savedGoogleConsent = localStorage.getItem('mithqal_cookie_consent');
  if (savedGoogleConsent === 'true') { ${command(granted[0])} }
  else if (savedGoogleConsent === 'false') { ${command(denied[0])} }
} catch (_) { /* Keep regional defaults when storage is unavailable. */ }`
    : ""
}
gtag('js', new Date());
gtag('config', '${measurementId}', { send_page_view: false });
</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>`;
}
