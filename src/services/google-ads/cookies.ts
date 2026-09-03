export const GOOGLE_ADS_REFRESH_TOKEN_COOKIE = "google_ads_refresh_token";
export const GOOGLE_ADS_CUSTOMER_ID_COOKIE = "google_ads_customer_id";
export const GOOGLE_ADS_OAUTH_STATE_COOKIE = "google_ads_oauth_state";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

export function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {};

  return header.split(";").reduce<Record<string, string>>((acc, part) => {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

export function getCookie(request: Request, name: string): string | null {
  const cookies = parseCookies(request.headers.get("cookie"));
  return cookies[name] ?? null;
}

function serializeCookie(
  name: string,
  value: string,
  options: { maxAge?: number; httpOnly?: boolean; secure?: boolean; sameSite?: "Lax" | "Strict" | "None" } = {},
): string {
  const parts = [`${name}=${encodeURIComponent(value)}`, "Path=/"];

  if (options.maxAge != null) {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  if (options.httpOnly !== false) {
    parts.push("HttpOnly");
  }

  if (options.secure) {
    parts.push("Secure");
  }

  parts.push(`SameSite=${options.sameSite ?? "Lax"}`);

  return parts.join("; ");
}

export function buildGoogleAdsSessionCookies(
  refreshToken: string,
  customerId: string,
  secure: boolean,
): string[] {
  const base = { maxAge: COOKIE_MAX_AGE_SECONDS, httpOnly: true, secure, sameSite: "Lax" as const };

  return [
    serializeCookie(GOOGLE_ADS_REFRESH_TOKEN_COOKIE, refreshToken, base),
    serializeCookie(GOOGLE_ADS_CUSTOMER_ID_COOKIE, customerId, base),
  ];
}

export function buildClearGoogleAdsSessionCookies(secure: boolean): string[] {
  const base = { maxAge: 0, httpOnly: true, secure, sameSite: "Lax" as const };

  return [
    serializeCookie(GOOGLE_ADS_REFRESH_TOKEN_COOKIE, "", base),
    serializeCookie(GOOGLE_ADS_CUSTOMER_ID_COOKIE, "", base),
  ];
}

export function buildOAuthStateCookie(state: string, secure: boolean): string {
  return serializeCookie(GOOGLE_ADS_OAUTH_STATE_COOKIE, state, {
    maxAge: 600,
    httpOnly: true,
    secure,
    sameSite: "Lax",
  });
}

export function buildClearOAuthStateCookie(secure: boolean): string {
  return serializeCookie(GOOGLE_ADS_OAUTH_STATE_COOKIE, "", {
    maxAge: 0,
    httpOnly: true,
    secure,
    sameSite: "Lax",
  });
}

export function readGoogleAdsSession(request: Request): {
  refreshToken: string | null;
  customerId: string | null;
} {
  return {
    refreshToken: getCookie(request, GOOGLE_ADS_REFRESH_TOKEN_COOKIE),
    customerId: getCookie(request, GOOGLE_ADS_CUSTOMER_ID_COOKIE),
  };
}

export function isSecureRequest(request: Request): boolean {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() === "https";
  }

  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return false;
  }
}
