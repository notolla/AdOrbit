export type PlatformId = "google_ads" | "meta_ads" | "linkedin_ads";

export type PlatformDefinition = {
  id: PlatformId;
  label: string;
  apiVersion: string;
  oauthConfigured: boolean;
  connected: boolean;
  pushSupported: boolean;
  metricsSupported: boolean;
  statusNote?: string;
};

function readPublicEnv(name: string): boolean {
  if (typeof import.meta === "undefined" || !import.meta.env) return false;
  return Boolean(import.meta.env[name as keyof ImportMetaEnv]);
}

export function getPlatformRegistry(options: {
  googleConnected: boolean;
  googleOAuthConfigured: boolean;
}): PlatformDefinition[] {
  const metaConfigured = readPublicEnv("VITE_META_ADS_APP_ID");
  const linkedinConfigured = readPublicEnv("VITE_LINKEDIN_ADS_CLIENT_ID");

  return [
    {
      id: "google_ads",
      label: "Google Ads",
      apiVersion: "v22+",
      oauthConfigured: options.googleOAuthConfigured,
      connected: options.googleConnected,
      pushSupported: true,
      metricsSupported: true,
    },
    {
      id: "meta_ads",
      label: "Meta Ads",
      apiVersion: "Marketing API v21+",
      oauthConfigured: metaConfigured,
      connected: false,
      pushSupported: false,
      metricsSupported: false,
      statusNote: metaConfigured ? "OAuth yapılandırıldı · entegrasyon sırada" : "VITE_META_ADS_APP_ID gerekli",
    },
    {
      id: "linkedin_ads",
      label: "LinkedIn Ads",
      apiVersion: "Marketing API v2025+",
      oauthConfigured: linkedinConfigured,
      connected: false,
      pushSupported: false,
      metricsSupported: false,
      statusNote: linkedinConfigured
        ? "OAuth yapılandırıldı · entegrasyon sırada"
        : "VITE_LINKEDIN_ADS_CLIENT_ID gerekli",
    },
  ];
}
