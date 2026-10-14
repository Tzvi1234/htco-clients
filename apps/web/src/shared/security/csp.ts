/**
 * The web app's Content Security Policy (slice 3.8). App Platform's static sites cannot set
 * response headers, so the built page carries it in a `<meta>` element; `frame-ancestors` is not
 * honoured there, which is why `framing.ts` refuses to run inside a frame. HSTS comes from the
 * `.app` top-level domain, which browsers preload as HTTPS-only.
 */
const REACT_ARIA_PRESSABLE_STYLE = "sha256-38RhXrc7EdReTKsOm23ZPOCUgniTUUcjky8QOOrQx6o=";

export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  // React Aria injects one fixed <style> (touch-action for pressable elements); its hash only.
  // styles.css repeats the rule, so an upgrade that changes the hash degrades nothing.
  `style-src 'self' '${REACT_ARIA_PRESSABLE_STYLE}'`,
  // The authenticator QR code arrives from the API as a data: image.
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

/** Insert the policy after the charset, before any script or style, so it applies to all of them. */
export function withContentSecurityPolicy(html: string): string {
  const meta = `<meta http-equiv="Content-Security-Policy" content="${CONTENT_SECURITY_POLICY}" />`;
  const charset = /<meta charset="utf-8" \/>/i.exec(html);
  if (charset === null) throw new Error("index.html has no <meta charset> in its head");
  const end = charset.index + charset[0].length;
  return `${html.slice(0, end)}\n    ${meta}${html.slice(end)}`;
}
