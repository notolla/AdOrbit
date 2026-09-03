import { getGoogleAdsAccessToken } from "./auth";
import type { GoogleAdsConfig } from "./config";
import { formatGoogleAdsApiError } from "./errors";

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
  return formatGoogleAdsApiError(response.status, raw);
}

export function resourceId(resourceName: string): string {
  return resourceName.split("/").pop() ?? "";
}

export function buildGoogleAdsCampaignUrl(customerId: string, campaignId: string): string {
  const normalizedCustomer = customerId.replace(/-/g, "");
  return `https://ads.google.com/aw/campaigns?campaignId=${campaignId}&ocid=${normalizedCustomer}`;
}
