/**
 * What the API's link callback says about an invitation or password reset link (Codex security
 * review, owner gate v4). The link itself never reaches this page: the API redeems it on the
 * server, keeps the session's tokens in an `HttpOnly` cookie this code cannot read, and sends the
 * browser here with a clean address, or with `?link=invalid` (expired, used or forged) or
 * `?link=too-many` (too many failed links from this address).
 */
export type LinkOutcome = "invalid" | "too-many" | null;

export function linkOutcome(search: unknown): LinkOutcome {
  if (typeof search !== "object" || search === null || !("link" in search)) return null;
  const value: unknown = (search as Record<string, unknown>)["link"];
  return value === "invalid" || value === "too-many" ? value : null;
}

/** The 12–128 characters the API asks for, and the same password twice. */
export function passwordProblem(password: string, repeat: string): "length" | "mismatch" | null {
  if (password.length < 12 || password.length > 128) return "length";
  return password === repeat ? null : "mismatch";
}
