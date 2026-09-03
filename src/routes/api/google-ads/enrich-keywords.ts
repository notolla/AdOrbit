import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { readGoogleAdsSession } from "@/services/google-ads/cookies";
import { enrichKeywordReportWithGoogleAds } from "@/services/keyword-enrichment";
import { ensureKeywordReport } from "@/lib/keyword-report-utils";
import type { WebsiteAnalysis } from "@/services/types";

const bodySchema = z.object({
  analysis: z.custom<WebsiteAnalysis>(),
});

export const Route = createFileRoute("/api/google-ads/enrich-keywords")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const json = await request.json();
          const { analysis } = bodySchema.parse(json);
          const session = readGoogleAdsSession(request);

          if (!session.refreshToken || !session.customerId) {
            return Response.json(
              { message: "Google Ads hesabı bağlı değil." },
              { status: 401 },
            );
          }

          const withReport = ensureKeywordReport(analysis);
          const enriched = await enrichKeywordReportWithGoogleAds(withReport, {
            refreshToken: session.refreshToken,
            customerId: session.customerId,
          });

          return Response.json({
            keyword_report: enriched.keyword_report,
            hasLiveData: enriched.keyword_report.some((row) => row.data_source === "google_ads_api"),
          });
        } catch (error) {
          console.error("[google-ads/enrich-keywords]", error);
          return Response.json(
            { message: "Anahtar kelime verileri güncellenemedi." },
            { status: 500 },
          );
        }
      },
    },
  },
});
