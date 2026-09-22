import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { renderGoogleTag } from "../src/lib/server/googleTag";

function executeTag(saved: string | null, requiresConsent = true, storageBlocked = false) {
  const html = renderGoogleTag("G-DTZYQSS4SE", requiresConsent);

  const context = {
    window: {} as Record<string, unknown>,
    localStorage: {
      getItem: () => {
        if (storageBlocked) throw new Error("Storage blocked");

        return saved;
      },
    },
  };

  context.window = context;
  runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)![1], context);
  const queue = context.window.dataLayer as IArguments[];

  return { queue, calls: queue.map((entry) => Array.from(entry)) };
}

describe("server-rendered Google tag", () => {
  test("puts exactly one loader in the initial head", () => {
    const template = readFileSync(new URL("../src/app.html", import.meta.url), "utf8");
    const html = template.replace("%google.tag%", renderGoogleTag("G-DTZYQSS4SE", true));
    expect(html).toMatch(/<head>\s*<!-- Google tag/);
    expect(
      html.match(/src="https:\/\/www.googletagmanager.com\/gtag\/js\?id=G-DTZYQSS4SE"/g),
    ).toHaveLength(1);
    expect(html.indexOf("gtag('config'")).toBeLessThan(html.indexOf("</head>"));
  });

  test("uses Google's arguments queue and defaults before configuration", () => {
    const { calls, queue } = executeTag(null);
    expect(Object.prototype.toString.call(queue[0])).toBe("[object Arguments]");
    expect(calls.slice(0, 2).map((call) => call.slice(0, 2))).toEqual([
      ["consent", "default"],
      ["consent", "default"],
    ]);
    expect(calls.filter((call) => call[0] === "config")).toEqual([
      ["config", "G-DTZYQSS4SE", { send_page_view: false }],
    ]);
    expect(calls.some((call) => call[1] === "update")).toBe(false);
  });

  test("restores both choices before config, and respects regional scope", () => {
    for (const [saved, state] of [
      ["true", "granted"],
      ["false", "denied"],
    ]) {
      const { calls } = executeTag(saved);
      const updateIndex = calls.findIndex((call) => call[1] === "update");
      expect(updateIndex).toBeGreaterThan(1);
      expect(updateIndex).toBeLessThan(calls.findIndex((call) => call[0] === "config"));
      expect(calls[updateIndex][2]).toEqual({
        analytics_storage: state,
        ad_storage: state,
        ad_user_data: state,
        ad_personalization: state,
      });
    }

    expect(executeTag("true", false).calls.some((call) => call[1] === "update")).toBe(false);
  });

  test("keeps defaults when storage is blocked or a choice is invalid", () => {
    for (const result of [executeTag(null, true, true), executeTag("invalid")]) {
      expect(result.calls.some((call) => call[1] === "update")).toBe(false);
      expect(result.calls.some((call) => call[0] === "config")).toBe(true);
    }
  });

  test("omits disabled or unsafe identifiers", () => {
    for (const id of [undefined, "", "G-X</script>"]) expect(renderGoogleTag(id, true)).toBe("");
  });
});
