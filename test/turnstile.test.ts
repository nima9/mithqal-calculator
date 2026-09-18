import { afterEach, describe, expect, jest, spyOn, test } from "bun:test";
import { Either } from "effect";
import { verifyTurnstileToken } from "../src/lib/utils/turnstile";

afterEach(() => {
  jest.restoreAllMocks();
});

describe("verifyTurnstileToken", () => {
  test("accepts only the expected action and hostname", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ success: true, action: "contact_email", hostname: "mithqal.app" }),
    );

    const result = await verifyTurnstileToken({
      token: "fresh-token",
      secretKey: "secret",
      expectedAction: "contact_email",
      allowedHostnames: new Set(["mithqal.app"]),
    });

    expect(Either.isRight(result)).toBe(true);
  });

  test("rejects mismatched actions and hostnames", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ success: true, action: "content_gate", hostname: "attacker.example" }),
    );

    const result = await verifyTurnstileToken({
      token: "fresh-token",
      secretKey: "secret",
      expectedAction: "contact_email",
      allowedHostnames: new Set(["mithqal.app"]),
    });

    expect(Either.isLeft(result)).toBe(true);
  });

  test("fails closed on an upstream error", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 503 }));

    const result = await verifyTurnstileToken({
      token: "fresh-token",
      secretKey: "secret",
      expectedAction: "contact_email",
      allowedHostnames: new Set(["mithqal.app"]),
    });

    expect(Either.isLeft(result)).toBe(true);
  });

  test("accepts Cloudflare's metadata-free response only in explicit test mode", async () => {
    spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(Response.json({ success: true, hostname: "example.com" }))
      .mockResolvedValueOnce(Response.json({ success: true, hostname: "example.com" }));

    const strictResult = await verifyTurnstileToken({
      token: "dummy-token",
      secretKey: "test-secret",
      expectedAction: "content_gate",
      allowedHostnames: new Set(["localhost"]),
    });
    const testResult = await verifyTurnstileToken({
      token: "dummy-token",
      secretKey: "test-secret",
      expectedAction: "content_gate",
      allowedHostnames: new Set(["localhost"]),
      allowTestResponse: true,
    });

    expect(Either.isLeft(strictResult)).toBe(true);
    expect(Either.isRight(testResult)).toBe(true);
  });
});
