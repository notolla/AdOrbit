import { getGoogleAdsAccessToken } from "./auth";
import type { GoogleAdsConfig } from "./config";

export type GoogleAdsApiErrorDetail = {
  message: string;
  errorCode?: string;
};

export async function googleAdsPost<T>(
  config: GoogleAdsConfig,
  path: string,
  body: unknown,
): Promise<T> {
  const accessToken = await getGoogleAdsAccessToken(config);
  const endpoint = `https://googleads.googleapis.com/${config.apiVersion}/customers/${config.customerId}/${path}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "developer-token": config.developerToken,
  };

  if (config.loginCustomerId) {
    headers["login-customer-id"] = config.loginCustomerId;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    throw await parseGoogleAdsError(response);
  }

  return (await response.json()) as T;
}

async function parseGoogleAdsError(response: Response): Promise<Error> {
  const raw = await response.text();

  try {
    const payload = JSON.parse(raw) as {
      error?: {
        message?: string;
        details?: Array<{
          errors?: Array<{ message?: string; errorCode?: Record<string, string> }>;
        }>;
      };
    };

    const detailMessages =
      payload.error?.details?.flatMap((detail) =>
        (detail.errors ?? []).map((item) => item.message).filter(Boolean),
      ) ?? [];

    const firstCode = payload.error?.details?.[0]?.errors?.[0]?.errorCode;
    const codeLabel = firstCode ? Object.values(firstCode)[0] : undefined;

    const message =
      detailMessages[0] ??
      payload.error?.message ??
      `Google Ads API hatası (${response.status})`;

    const error = new Error(message) as Error & { status?: number; code?: string };
    error.status = response.status;
    if (codeLabel) error.code = codeLabel;
    return error;
  } catch {
    return new Error(`Google Ads API hatası (${response.status}): ${raw.slice(0, 240)}`);
  }
}

export function resourceId(resourceName: string): string {
  return resourceName.split("/").pop() ?? "";
}

export function buildGoogleAdsCampaignUrl(customerId: string, campaignId: string): string {
  const normalizedCustomer = customerId.replace(/-/g, "");
  return `https://ads.google.com/aw/campaigns?campaignId=${campaignId}&ocid=${normalizedCustomer}`;
}
