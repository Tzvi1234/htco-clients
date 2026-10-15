/** The session tokens an invitation or password reset link hands the web app. */
export interface LinkTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * The sign-in service puts the link's tokens in the URL fragment, which never reaches a server
 * (`#access_token=…&refresh_token=…&type=invite|recovery`), or an error when the link is no longer
 * valid (`#error=access_denied&error_code=otp_expired`).
 */
export function tokensOf(hash: string): LinkTokens | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (params.has("error") || accessToken === null || refreshToken === null) return null;
  return { accessToken, refreshToken };
}

/** The 12–128 characters the API asks for, and the same password twice. */
export function passwordProblem(password: string, repeat: string): "length" | "mismatch" | null {
  if (password.length < 12 || password.length > 128) return "length";
  return password === repeat ? null : "mismatch";
}
