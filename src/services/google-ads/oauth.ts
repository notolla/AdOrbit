import { getGoogleAdsOAuthConfig, normalizeGoogleAdsApiVersion } from "./config";

const ADWORDS_SCOPE = "https://www.googleapis.com/auth/adwords";

export function buildGoogleAdsAuthUrl(redirectUri: string, state: string): string {
  const oauth = getGoogleAdsOAuthConfig();
  if (!oauth) {
    throw new Error("Google Ads OAuth yapılandırması eksik.");
  }

  const params = new URLSearchParams({
    client_id: oauth.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: ADWORDS_SCOPE,
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeAuthorizationCode(
  code: string,
  redirectUri: string,
): Promise<{ refreshToken: string; accessToken: string }> {
  const oauth = getGoogleAdsOAuthConfig();
  if (!oauth) {
    throw new Error("Google Ads OAuth yapılandırması eksik.");
  }

  const body = new URLSearchParams({
    code,
    client_id: oauth.clientId,
    client_secret: oauth.clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OAuth token değişimi başarısız (${response.status}): ${errorText.slice(0, 200)}`);
  }

  const payload = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
  };

  if (!payload.refresh_token) {
    throw new Error(
      "Google hesabından yenileme jetonu alınamadı. Lütfen bağlantıyı kaldırıp tekrar deneyin.",
    );
  }

  return {
    refreshToken: payload.refresh_token,
    accessToken: payload.access_token,
  };
}

async function fetchAccessibleCustomers(
  accessToken: string,
  apiVersion: string,
  developerToken: string,
): Promise<string[]> {
  const url = `https://googleads.googleapis.com/${apiVersion}/customers:listAccessibleCustomers`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "developer-token": developerToken,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(
      `Erişilebilir Google Ads hesapları alınamadı (${response.status}, ${apiVersion}): ${errorText.slice(0, 200)}`,
    ) as Error & { status?: number; apiVersion?: string };
    error.status = response.status;
    error.apiVersion = apiVersion;
    throw error;
  }

  const payload = (await response.json()) as { resourceNames?: string[] };
  return (payload.resourceNames ?? [])
    .map((name) => name.replace("customers/", "").replace(/-/g, "").trim())
    .filter(Boolean);
}

export async function listAccessibleCustomerIds(accessToken: string): Promise<string[]> {
  const oauth = getGoogleAdsOAuthConfig();
  if (!oauth) {
    throw new Error("Google Ads OAuth yapılandırması eksik.");
  }

  const primaryVersion = normalizeGoogleAdsApiVersion(oauth.apiVersion);
  const fallbackVersion = "v23";

  try {
    return await fetchAccessibleCustomers(accessToken, primaryVersion, oauth.developerToken);
  } catch (primaryError) {
    const status = (primaryError as Error & { status?: number }).status;
    if (status === 404 && primaryVersion !== fallbackVersion) {
      console.warn(
        `[google-ads/oauth] ${primaryVersion} listAccessibleCustomers 404 — retrying ${fallbackVersion}`,
      );
      return await fetchAccessibleCustomers(accessToken, fallbackVersion, oauth.developerToken);
    }
    throw primaryError;
  }
}

export function resolveEnvCustomerId(): string | null {
  const raw =
    typeof process !== "undefined" ? process.env.GOOGLE_ADS_CUSTOMER_ID : undefined;
  if (!raw?.trim()) return null;
  return raw.replace(/-/g, "").trim();
}

export function resolveOAuthRedirectUri(request: Request): string {
  const configured =
    typeof process !== "undefined" ? process.env.GOOGLE_ADS_REDIRECT_URI : undefined;
  if (configured) {
    return configured;
  }

  const url = new URL(request.url);
  return `${url.origin}/api/google-ads/oauth/callback`;
}
