import type { GoogleAdsConfig } from "./config";
import { getGoogleAdsConfig, resolveGoogleAdsConfig } from "./config";

type TokenCache = {
  accessToken: string;
  expiresAt: number;
};

const tokenCache = new Map<string, TokenCache>();

function cacheKey(config: GoogleAdsConfig): string {
  return `${config.clientId}:${config.refreshToken.slice(-8)}`;
}

export async function getGoogleAdsAccessToken(config?: GoogleAdsConfig): Promise<string> {
  const resolved = config ?? getGoogleAdsConfig();
  if (!resolved) {
    throw new Error("Google Ads API yapılandırması eksik.");
  }

  const key = cacheKey(resolved);
  const cached = tokenCache.get(key);
  if (cached && Date.now() < cached.expiresAt - 60_000) {
    return cached.accessToken;
  }

  const body = new URLSearchParams({
    client_id: resolved.clientId,
    client_secret: resolved.clientSecret,
    refresh_token: resolved.refreshToken,
    grant_type: "refresh_token",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Ads OAuth hatası (${response.status}): ${errorText.slice(0, 200)}`);
  }

  const payload = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  tokenCache.set(key, {
    accessToken: payload.access_token,
    expiresAt: Date.now() + payload.expires_in * 1000,
  });

  return payload.access_token;
}

export async function getGoogleAdsAccessTokenForSession(session: {
  refreshToken: string;
  customerId: string;
}): Promise<string> {
  const config = resolveGoogleAdsConfig(session);
  if (!config) {
    throw new Error("Google Ads API yapılandırması eksik.");
  }

  return getGoogleAdsAccessToken(config);
}
