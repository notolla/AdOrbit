import type { WebsiteAnalysis } from "@/services/types";

export type GoogleAdsConnectionStatus = {
  connected: boolean;
  oauthConfigured: boolean;
  customerId: string | null;
};

export async function fetchGoogleAdsStatus(): Promise<GoogleAdsConnectionStatus> {
  const response = await fetch("/api/google-ads/status", {
    credentials: "include",
  });

  if (!response.ok) {
    return { connected: false, oauthConfigured: false, customerId: null };
  }

  return (await response.json()) as GoogleAdsConnectionStatus;
}

export function startGoogleAdsOAuth(): void {
  window.location.href = "/api/google-ads/oauth/start";
}

export async function disconnectGoogleAds(): Promise<void> {
  await fetch("/api/google-ads/disconnect", {
    method: "POST",
    credentials: "include",
  });
}

export async function enrichKeywordsWithGoogleAds(
  analysis: WebsiteAnalysis,
): Promise<{ keyword_report: WebsiteAnalysis["keyword_report"]; hasLiveData: boolean }> {
  const response = await fetch("/api/google-ads/enrich-keywords", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ analysis }),
    signal: AbortSignal.timeout(45_000),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(payload.message ?? "Anahtar kelime verileri güncellenemedi.");
  }

  return (await response.json()) as {
    keyword_report: WebsiteAnalysis["keyword_report"];
    hasLiveData: boolean;
  };
}

export type PushCampaignsResponse = {
  success: true;
  campaignId: string;
  campaignResourceName: string;
  customerId: string;
  viewUrl: string;
  stats: {
    adGroups: number;
    keywords: number;
    negativeKeywords: number;
    responsiveSearchAds: number;
  };
};

export async function pushCampaignsToGoogleAds(
  analysis: WebsiteAnalysis,
  websiteUrl: string,
): Promise<PushCampaignsResponse> {
  const response = await fetch("/api/google-ads/push-campaigns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ analysis, website_url: websiteUrl }),
    signal: AbortSignal.timeout(90_000),
  });

  const payload = (await response.json().catch(() => ({}))) as
    | PushCampaignsResponse
    | { success?: false; message?: string };

  if (!response.ok || !("success" in payload) || payload.success !== true) {
    const message = "message" in payload ? payload.message : undefined;
    throw new Error(message ?? "Kampanya Google Ads'e aktarılamadı.");
  }

  return payload;
}

export const GOOGLE_ADS_ERROR_MESSAGES: Record<string, string> = {
  not_configured: "Google Ads OAuth henüz yapılandırılmamış. Lütfen yöneticinize başvurun.",
  access_denied: "Google hesabı bağlantısı iptal edildi.",
  missing_code: "OAuth yanıtı eksik. Lütfen tekrar deneyin.",
  invalid_state: "Güvenlik doğrulaması başarısız. Lütfen tekrar deneyin.",
  no_accounts: "Bu Google hesabına bağlı Google Ads hesabı bulunamadı.",
  list_accounts_failed:
    "Google Ads hesapları listelenemedi. Developer Token onayını ve Google Ads API erişimini kontrol edin.",
  api_not_enabled:
    "Google Ads API Cloud projenizde kapalı. Google Cloud Console → API Library → Google Ads API → Enable.",
  token_exchange_failed: "Google OAuth jetonu alınamadı. Redirect URI ayarını kontrol edin.",
  missing_refresh_token:
    "Yenileme jetonu alınamadı. Google hesabınızın uygulama erişimini kaldırıp tekrar deneyin.",
  exchange_failed: "Google Ads hesabı bağlanırken bir hata oluştu.",
};
