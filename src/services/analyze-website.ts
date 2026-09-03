import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { runWebsiteAnalysis } from "./analyze-core";
import { toUserFacingError } from "./analysis-errors";
import type { WebsiteAnalysis } from "./types";

const analyzeInputSchema = z.object({
  url: z.string().trim().min(3, "Geçerli bir web sitesi adresi girin."),
  tier: z.enum(["primary", "fallback"]).optional(),
});

export const analyzeWebsite = createServerFn({ method: "POST" })
  .validator(analyzeInputSchema)
  .handler(async ({ data }): Promise<WebsiteAnalysis> => {
    try {
      return await runWebsiteAnalysis(data.url, { tier: data.tier ?? "primary" });
    } catch (error) {
      throw toUserFacingError(error);
    }
  });
