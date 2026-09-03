export type GoogleAdsConfig = {
  developerToken: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  customerId: string;
  loginCustomerId: string | null;
  apiVersion: string;
};

export type GoogleAdsOAuthConfig = {
  developerToken: string;
  clientId: string;
  clientSecret: string;
  apiVersion: string;
};

export type GoogleAdsSessionCredentials = {
  refreshToken: string;
  customerId: string;
  loginCustomerId?: string | null;
};

const DEPRECATED_API_VERSIONS = new Set(["v18", "v19", "v20", "v21"]);
const DEFAULT_API_VERSION = "v22";

function readEnv(name: string): string | undefined {
  // Server secrets must come from process.env — import.meta.env can bake stale values at build time.
  if (typeof process !== "undefined" && process.env[name]) {
    return process.env[name];
  }

  const viteValue =
    typeof import.meta !== "undefined" && import.meta.env
      ? (import.meta.env[name as keyof ImportMetaEnv] as string | undefined)
      : undefined;

  return viteValue;
}

export function normalizeGoogleAdsApiVersion(value?: string | null): string {
  const normalized = (value ?? DEFAULT_API_VERSION).trim();
  if (DEPRECATED_API_VERSIONS.has(normalized)) {
    return DEFAULT_API_VERSION;
  }
  return normalized || DEFAULT_API_VERSION;
}

function normalizeCustomerId(value: string): string {
  return value.replace(/-/g, "").trim();
}

export function getGoogleAdsOAuthConfig(): GoogleAdsOAuthConfig | null {
  const developerToken = readEnv("GOOGLE_ADS_DEVELOPER_TOKEN");
  const clientId = readEnv("GOOGLE_ADS_CLIENT_ID");
  const clientSecret = readEnv("GOOGLE_ADS_CLIENT_SECRET");

  if (!developerToken || !clientId || !clientSecret) {
    return null;
  }

  return {
    developerToken,
    clientId,
    clientSecret,
    apiVersion: normalizeGoogleAdsApiVersion(readEnv("GOOGLE_ADS_API_VERSION")),
  };
}

export function isGoogleAdsOAuthConfigured(): boolean {
  return getGoogleAdsOAuthConfig() !== null;
}

export function getGoogleAdsConfig(): GoogleAdsConfig | null {
  const oauth = getGoogleAdsOAuthConfig();
  const refreshToken = readEnv("GOOGLE_ADS_REFRESH_TOKEN");
  const customerId = readEnv("GOOGLE_ADS_CUSTOMER_ID");

  if (!oauth || !refreshToken || !customerId) {
    return null;
  }

  const loginCustomerId = readEnv("GOOGLE_ADS_LOGIN_CUSTOMER_ID");

  return {
    ...oauth,
    refreshToken,
    customerId: normalizeCustomerId(customerId),
    loginCustomerId: loginCustomerId ? normalizeCustomerId(loginCustomerId) : null,
  };
}

export function buildGoogleAdsConfigFromSession(
  session: GoogleAdsSessionCredentials,
): GoogleAdsConfig | null {
  const oauth = getGoogleAdsOAuthConfig();
  if (!oauth) {
    return null;
  }

  const loginCustomerId = readEnv("GOOGLE_ADS_LOGIN_CUSTOMER_ID");

  return {
    ...oauth,
    refreshToken: session.refreshToken,
    customerId: normalizeCustomerId(session.customerId),
    loginCustomerId: session.loginCustomerId
      ? normalizeCustomerId(session.loginCustomerId)
      : loginCustomerId
        ? normalizeCustomerId(loginCustomerId)
        : null,
  };
}

export function isGoogleAdsConfigured(): boolean {
  return getGoogleAdsConfig() !== null;
}

export function resolveGoogleAdsConfig(
  session?: GoogleAdsSessionCredentials | null,
): GoogleAdsConfig | null {
  if (session?.refreshToken && session.customerId) {
    return buildGoogleAdsConfigFromSession(session);
  }

  return getGoogleAdsConfig();
}
