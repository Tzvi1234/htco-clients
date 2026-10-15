import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import { CONTENT_SECURITY_POLICY, withSecurityPolicies } from "./csp.ts";
import { TWEAKS_BOOT_SCRIPT } from "../theme/boot.ts";
import { refuseFraming } from "./framing.ts";

describe("the Content Security Policy (AC-3.8.2)", () => {
  it("allows only this origin, plus data: images for the authenticator QR code", () => {
    expect(CONTENT_SECURITY_POLICY).toContain("default-src 'self'");
    expect(CONTENT_SECURITY_POLICY).toContain("script-src 'self'");
    expect(CONTENT_SECURITY_POLICY).toContain("img-src 'self' data:");
    expect(CONTENT_SECURITY_POLICY).toContain("object-src 'none'");
    expect(CONTENT_SECURITY_POLICY).not.toContain("unsafe-inline");
    expect(CONTENT_SECURITY_POLICY).not.toContain("unsafe-eval");
    expect(CONTENT_SECURITY_POLICY).not.toMatch(/https?:/);
  });

  it("is written into the built page's head, before any script", () => {
    const html = '<html><head><meta charset="utf-8" /><script src="/a.js"></script></head></html>';
    const built = withSecurityPolicies(html);
    const meta = built.indexOf('http-equiv="Content-Security-Policy"');
    expect(meta).toBeGreaterThan(-1);
    expect(meta).toBeLessThan(built.indexOf("<script"));
  });

  it("allows exactly the page's inline scripts by their hash, and nothing else inline", () => {
    const boot = "document.documentElement.dataset.pal='sbb';";
    const html = `<html><head><meta charset="utf-8" /><script>${boot}</script><script type="module" src="/a.js"></script></head></html>`;
    const built = withSecurityPolicies(html);
    const hash = createHash("sha256").update(boot, "utf8").digest("base64");

    expect(built).toContain(`script-src 'self' 'sha256-${hash}';`);
    expect(withSecurityPolicies('<head><meta charset="utf-8" /></head>')).toContain(
      "script-src 'self';",
    );
  });

  it("carries the tweaks boot script's hash once index.html has it", () => {
    const html = `<head><meta charset="utf-8" /><script>${TWEAKS_BOOT_SCRIPT}</script></head>`;
    const hash = createHash("sha256").update(TWEAKS_BOOT_SCRIPT, "utf8").digest("base64");
    expect(withSecurityPolicies(html)).toContain(`'sha256-${hash}'`);
  });

  it("sends no referrer to other sites", () => {
    const built = withSecurityPolicies('<head><meta charset="utf-8" /></head>');
    expect(built).toContain('<meta name="referrer" content="same-origin" />');
  });
});

describe("framing (clickjacking)", () => {
  it("refuses to run inside a frame", () => {
    const top = {};
    expect(refuseFraming({ self: top, top })).toBe(false);
    expect(refuseFraming({ self: {}, top })).toBe(true);
  });

  it("refuses when the top window cannot be read", () => {
    const framed = {
      self: {},
      get top(): unknown {
        throw new Error("cross-origin");
      },
    };
    expect(refuseFraming(framed)).toBe(true);
  });
});
