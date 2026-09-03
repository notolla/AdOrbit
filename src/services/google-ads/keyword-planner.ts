import { getGoogleAdsAccessToken } from "./auth";
import type { GoogleAdsConfig } from "./config";
import { getGoogleAdsConfig } from "./config";

/** Türkçe */
const LANGUAGE_TR = "languageConstants/1037";
/** Türkiye */
const GEO_TURKEY = "geoTargetConstants/2792";

export type KeywordPlannerCompetition = "LOW" | "MEDIUM" | "HIGH" | "UNSPECIFIED";

export type KeywordPlannerMetric = {
  keyword: string;
  avgMonthlySearches: number;
  competition: KeywordPlannerCompetition;
  estimatedCpcTry: number;
};

const KEYWORD_SEED_LIMIT = 20;

function parseMicrosToTry(lowMicros?: string | number | null, highMicros?: string | number | null): number {
  const low = Number(lowMicros ?? 0);
  const high = Number(highMicros ?? 0);

  if (!low && !high) return 0;

  const avgMicros = high > 0 ? (low + high) / 2 : low;
  return Math.round((avgMicros / 1_000_000) * 100) / 100;
}

function parseMonthlySearches(value?: string | number | null): number {
  if (value == null) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}

function normalizeCompetition(value?: string | null): KeywordPlannerCompetition {
  if (value === "LOW" || value === "MEDIUM" || value === "HIGH") return value;
  return "UNSPECIFIED";
}

export async function fetchKeywordPlannerMetrics(
  keywords: string[],
  configOverride?: GoogleAdsConfig | null,
): Promise<KeywordPlannerMetric[]> {
  const config = configOverride ?? getGoogleAdsConfig();
  if (!config) {
    throw new Error("Google Ads API yapılandırması eksik.");
  }

  const seedKeywords = [...new Set(keywords.map((k) => k.trim()).filter(Boolean))].slice(
    0,
    KEYWORD_SEED_LIMIT,
  );

  if (seedKeywords.length === 0) {
    return [];
  }

  const accessToken = await getGoogleAdsAccessToken(config);
  const endpoint = `https://googleads.googleapis.com/${config.apiVersion}/customers/${config.customerId}:generateKeywordIdeas`;

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
    body: JSON.stringify({
      language: LANGUAGE_TR,
      geoTargetConstants: [GEO_TURKEY],
      includeAdultKeywords: false,
      keywordPlanNetwork: "GOOGLE_SEARCH",
      keywordSeed: {
        keywords: seedKeywords,
      },
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Keyword Planner hatası (${response.status}): ${errorText.slice(0, 300)}`);
  }

  const payload = (await response.json()) as {
    results?: Array<{
      text?: string;
      keywordIdeaMetrics?: {
        avgMonthlySearches?: string | number;
        competition?: string;
        lowTopOfPageBidMicros?: string | number;
        highTopOfPageBidMicros?: string | number;
      };
    }>;
  };

  return (payload.results ?? [])
    .filter((item) => item.text)
    .map((item) => {
      const metrics = item.keywordIdeaMetrics;
      return {
        keyword: item.text!.trim(),
        avgMonthlySearches: parseMonthlySearches(metrics?.avgMonthlySearches),
        competition: normalizeCompetition(metrics?.competition),
        estimatedCpcTry: parseMicrosToTry(
          metrics?.lowTopOfPageBidMicros,
          metrics?.highTopOfPageBidMicros,
        ),
      };
    });
}

export function matchPlannerMetric(
  keyword: string,
  metrics: KeywordPlannerMetric[],
): KeywordPlannerMetric | null {
  const normalized = keyword.trim().toLowerCase();
  return (
    metrics.find((item) => item.keyword.toLowerCase() === normalized) ??
    metrics.find(
      (item) =>
        item.keyword.toLowerCase().includes(normalized) ||
        normalized.includes(item.keyword.toLowerCase()),
    ) ??
    null
  );
}
