import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { toUserFacingError } from "@/services/analysis-errors";
import { generateStrategyReport } from "@/services/strategy-generator";

const channelSchema = z.enum(["google_ads", "linkedin_ads", "meta_ads"]);

const bodySchema = z.object({
  product_service: z.string().trim().min(3),
  user_name: z.string().trim().min(2).optional(),
  user_email: z.string().trim().email().optional(),
  website_url: z.string().trim().optional(),
  channels: z.array(channelSchema).min(1),
  audience_profile: z.string().trim().min(1),
  geo_scope: z.string().trim().min(1),
  campaign_goal: z.string().trim().min(1),
  budget_range: z.string().trim().min(1),
  communication_tone: z.string().trim().min(1),
  industry_notes: z.string().trim().optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
});

export const Route = createFileRoute("/api/generate-strategy")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const json = await request.json();
          const body = bodySchema.parse(json);
          const report = await generateStrategyReport({
            product_service: body.product_service,
            user_name: body.user_name,
            user_email: body.user_email,
            website_url: body.website_url || undefined,
            channels: body.channels,
            audience_profile: body.audience_profile,
            geo_scope: body.geo_scope,
            campaign_goal: body.campaign_goal,
            budget_range: body.budget_range,
            communication_tone: body.communication_tone,
            industry_notes: body.industry_notes,
            email: body.email || undefined,
          });
          return Response.json(report);
        } catch (error) {
          const friendly = toUserFacingError(error);
          return Response.json({ message: friendly.message }, { status: 500 });
        }
      },
    },
  },
});
