import { buildKeywordReportEntry } from "@/lib/keyword-report-utils";
import type { CommercialIntent, KeywordReportEntry, WebsiteAnalysis } from "./types";
import type { GoogleAdsSessionCredentials } from "./google-ads/config";
import { resolveGoogleAdsConfig } from "./google-ads/config";
import {
  fetchKeywordPlannerMetrics,
  matchPlannerMetric,
  type KeywordPlannerCompetition,
} from "./google-ads/keyword-planner";

function collectUniqueKeywords(analysis: WebsiteAnalysis): string[] {
  const seen = new Set<string>();

  return analysis.campaigns.flatMap((campaign) =>
    campaign.keywords.filter((keyword) => {
      const key = keyword.trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    }),
  );
}

function competitionToIntent(competition: KeywordPlannerCompetition): CommercialIntent {
  if (competition === "HIGH") return "Yüksek";
  if (competition === "LOW") return "Düşük";
  return "Orta";
}

function mergeWithPlannerData(
  analysis: WebsiteAnalysis,
  plannerMetrics: Awaited<ReturnType<typeof fetchKeywordPlannerMetrics>>,
): KeywordReportEntry[] {
  const keywords = collectUniqueKeywords(analysis);

  return keywords.map((keyword, index) => {
    const planner = matchPlannerMetric(keyword, plannerMetrics);

    if (!planner || (planner.avgMonthlySearches === 0 && planner.estimatedCpcTry === 0)) {
      return buildKeywordReportEntry(keyword, index);
    }

    const estimated_cpc_try =
      planner.estimatedCpcTry > 0 ? planner.estimatedCpcTry : buildKeywordReportEntry(keyword, index).estimated_cpc_try;

    const search_volume_monthly =
      planner.avgMonthlySearches > 0
        ? planner.avgMonthlySearches
        : buildKeywordReportEntry(keyword, index).search_volume_monthly;

    return {
      keyword,
      estimated_cpc_try,
      search_volume_monthly,
      commercial_intent: competitionToIntent(planner.competition),
      competition: planner.competition,
      data_source: "google_ads_api" as const,
    };
  });
}

export async function enrichKeywordReportWithGoogleAds(
  analysis: WebsiteAnalysis,
  session?: GoogleAdsSessionCredentials | null,
): Promise<WebsiteAnalysis> {
  const config = resolveGoogleAdsConfig(session ?? null);
  if (!config) {
    return analysis;
  }

  const keywords = collectUniqueKeywords(analysis);
  if (keywords.length === 0) {
    return analysis;
  }

  try {
    const plannerMetrics = await fetchKeywordPlannerMetrics(keywords, config);
    if (plannerMetrics.length === 0) {
      return analysis;
    }

    return {
      ...analysis,
      keyword_report: mergeWithPlannerData(analysis, plannerMetrics),
    };
  } catch (error) {
    console.error("[keyword-enrichment] Google Ads Keyword Planner failed:", error);
    return analysis;
  }
}

export function hasGoogleAdsKeywordData(analysis: WebsiteAnalysis): boolean {
  return analysis.keyword_report.some((row) => row.data_source === "google_ads_api");
}
