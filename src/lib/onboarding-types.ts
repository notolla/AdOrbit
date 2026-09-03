import type { StrategyChannel } from "@/services/strategy-types";

export type OnboardingFormData = {
  user_name: string;
  user_email: string;
  website_url: string;
  product_service: string;
  channels: StrategyChannel[];
  audience_profile: string;
  geo_scope: string;
  campaign_goal: string;
  budget_range: string;
  communication_tone: string;
};

export const INITIAL_ONBOARDING_FORM: OnboardingFormData = {
  user_name: "",
  user_email: "",
  website_url: "",
  product_service: "",
  channels: ["google_ads"],
  audience_profile: "",
  geo_scope: "",
  campaign_goal: "",
  budget_range: "",
  communication_tone: "",
};

/** Adım 1: iletişim + 7 strateji adımı */
export const ONBOARDING_STEP_COUNT = 8;

export type OnboardingBrief = {
  audience_profile: string;
  geo_scope: string;
  campaign_goal: string;
  budget_range: string;
  communication_tone: string;
  channels: StrategyChannel[];
};

export function firstNameFromFullName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return "";
  return trimmed.split(/\s+/)[0] ?? trimmed;
}
