import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { readGoogleAdsSession } from "@/services/google-ads/cookies";
import { buildGoogleAdsConfigFromSession } from "@/services/google-ads/config";
import { pushCampaignsToGoogleAds } from "@/services/google-ads/push-campaigns";
import { ensureRsaCopy } from "@/lib/ad-copy-utils";
import { ensureKeywordReport } from "@/lib/keyword-report-utils";
import type { WebsiteAnalysis } from "@/services/types";

const bodySchema = z.object({
  analysis: z.custom<WebsiteAnalysis>(),
  website_url: z.string().trim().min(3),
});

export const Route = createFileRoute("/api/google-ads/push-campaigns")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const json = await request.json();
          const { analysis, website_url } = bodySchema.parse(json);
          const session = readGoogleAdsSession(request);

          if (!session.refreshToken || !session.customerId) {
            return Response.json(
              { success: false, message: "Google Ads hesabı bağlı değil." },
              { status: 401 },
            );
          }

          const config = buildGoogleAdsConfigFromSession({
            refreshToken: session.refreshToken,
            customerId: session.customerId,
          });

          if (!config) {
            return Response.json(
              { success: false, message: "Google Ads API yapılandırması eksik." },
              { status: 500 },
            );
          }

          const prepared = ensureRsaCopy(ensureKeywordReport(analysis));
          const result = await pushCampaignsToGoogleAds(config, {
            analysis: prepared,
            websiteUrl: website_url,
          });

          return Response.json(result);
        } catch (error) {
          console.error("[google-ads/push-campaigns]", error);
          const message =
            error instanceof Error ? error.message : "Kampanya Google Ads'e aktarılamadı.";
          return Response.json({ success: false, message }, { status: 500 });
        }
      },
    },
  },
});
