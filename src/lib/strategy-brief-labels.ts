import type { StrategyBrief } from "@/services/strategy-types";
import {
  AUDIENCE_PROFILES,
  BUDGET_RANGES,
  CAMPAIGN_GOALS,
  COMMUNICATION_TONES,
  GEO_SCOPES,
  labelForChannel,
  labelForOption,
} from "@/lib/onboarding-options";

export function formatStrategyBriefLines(brief: StrategyBrief): string[] {
  return [
    `Kanallar: ${brief.channels.map(labelForChannel).join(", ")}`,
    `Hedef kitle: ${labelForOption(AUDIENCE_PROFILES, brief.audience_profile)}`,
    `Coğrafya: ${labelForOption(GEO_SCOPES, brief.geo_scope)}`,
    `KPI: ${labelForOption(CAMPAIGN_GOALS, brief.campaign_goal)}`,
    `Bütçe: ${labelForOption(BUDGET_RANGES, brief.budget_range)}`,
    `Ton: ${labelForOption(COMMUNICATION_TONES, brief.communication_tone)}`,
  ];
}
