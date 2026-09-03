import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { toUserFacingError } from "@/services/analysis-errors";
import { generateStrategyReport } from "@/services/strategy-generator";

const bodySchema = z.object({
  product_service: z.string().trim().min(3),
  website_url: z.string().trim().optional(),
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
            website_url: body.website_url || undefined,
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
