import { analyzeWithGoogleAI, type AnalysisTier } from "./google-ai-analysis";
import { scrapeWebsite } from "./scrape-website";
import { toUserFacingError } from "./analysis-errors";
import { enrichKeywordReportWithGoogleAds } from "./keyword-enrichment";
import { ensureRsaCopy } from "@/lib/ad-copy-utils";
import { ensureKeywordReport } from "@/lib/keyword-report-utils";
import type { GoogleAdsSessionCredentials } from "./google-ads/config";
import type { WebsiteAnalysis } from "./types";

export type RunWebsiteAnalysisOptions = {
  tier?: AnalysisTier;
  googleAdsSession?: GoogleAdsSessionCredentials | null;
};

export async function runWebsiteAnalysis(
  url: string,
  options: RunWebsiteAnalysisOptions = {},
): Promise<WebsiteAnalysis> {
  try {
    const scraped = await scrapeWebsite(url);
    const analysis = await analyzeWithGoogleAI(scraped, options.tier ?? "primary");
    const withReport = ensureKeywordReport(analysis);
    const enriched = await enrichKeywordReportWithGoogleAds(withReport, options.googleAdsSession);
    return ensureRsaCopy(enriched);
  } catch (error) {
    throw toUserFacingError(error);
  }
}
