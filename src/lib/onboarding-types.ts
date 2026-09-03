import type { StrategyChannel } from "@/services/strategy-types";

export type OnboardingFormData = {
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
  website_url: "",
  product_service: "",
  channels: ["google_ads"],
  audience_profile: "",
  geo_scope: "",
  campaign_goal: "",
  budget_range: "",
  communication_tone: "",
};

export const ONBOARDING_STEP_COUNT = 7;

export type OnboardingBrief = {
  audience_profile: string;
  geo_scope: string;
  campaign_goal: string;
  budget_range: string;
  communication_tone: string;
  channels: StrategyChannel[];
};
