/**
 * The web app's Content Security Policy (slice 3.8). App Platform's static sites cannot set
 * response headers, so the built page carries it in a `<meta>` element; `frame-ancestors` is not
 * honoured there, which is why `framing.ts` refuses to run inside a frame. HSTS comes from the
 * `.app` top-level domain, which browsers preload as HTTPS-only.
 */
import { createHash } from "node:crypto";

const REACT_ARIA_PRESSABLE_STYLE = "sha256-38RhXrc7EdReTKsOm23ZPOCUgniTUUcjky8QOOrQx6o=";

export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  // React Aria injects one fixed <style> (touch-action for pressable elements); its hash only.
  // styles.css repeats the rule, so an upgrade that changes the hash degrades nothing.
  `style-src 'self' '${REACT_ARIA_PRESSABLE_STYLE}'`,
  // The authenticator QR code arrives from the API as a data: image; listing photos come from
  // Etsy's image host (read only, no cookies; the referrer stays on this site).
  "img-src 'self' data: https://i.etsystatic.com",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

/** Classic inline scripts (no `src`): the tweaks boot script that runs before the first paint. */
const INLINE_SCRIPT = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;

/** The policy for one page: its inline scripts are allowed by their SHA-256 hash, nothing else. */
export function policyFor(html: string): string {
  const hashes = [...html.matchAll(INLINE_SCRIPT)].map(([, body = ""]) => {
    const digest = createHash("sha256").update(body, "utf8").digest("base64");
    return `'sha256-${digest}'`;
  });
  if (hashes.length === 0) return CONTENT_SECURITY_POLICY;
  return CONTENT_SECURITY_POLICY.replace(
    "script-src 'self'",
    ["script-src 'self'", ...hashes].join(" "),
  );
}

/** Insert the policies after the charset, before any script or style, so it applies to all of them. */
export function withSecurityPolicies(html: string): string {
  const meta =
    `<meta http-equiv="Content-Security-Policy" content="${policyFor(html)}" />\n` +
    // Addresses and query strings never leave for another site.
    `    <meta name="referrer" content="same-origin" />`;
  const charset = /<meta charset="utf-8" \/>/i.exec(html);
  if (charset === null) throw new Error("index.html has no <meta charset> in its head");
  const end = charset.index + charset[0].length;
  return `${html.slice(0, end)}\n    ${meta}${html.slice(end)}`;
}
