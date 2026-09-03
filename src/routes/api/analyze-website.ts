import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { runWebsiteAnalysis } from "@/services/analyze-core";
import { toUserFacingError } from "@/services/analysis-errors";
import { readGoogleAdsSession } from "@/services/google-ads/cookies";

const bodySchema = z.object({
  url: z.string().trim().min(3),
  tier: z.enum(["primary", "fallback"]).optional(),
});

export const Route = createFileRoute("/api/analyze-website")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const json = await request.json();
          const { url, tier } = bodySchema.parse(json);
          const session = readGoogleAdsSession(request);
          const googleAdsSession =
            session.refreshToken && session.customerId
              ? { refreshToken: session.refreshToken, customerId: session.customerId }
              : null;

          const analysis = await runWebsiteAnalysis(url, {
            tier: tier ?? "primary",
            googleAdsSession,
          });
          return Response.json(analysis);
        } catch (error) {
          const friendly = toUserFacingError(error);
          return Response.json({ message: friendly.message }, { status: 500 });
        }
      },
    },
  },
});
