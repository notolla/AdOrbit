export type StrategyChannel = "google_ads" | "linkedin_ads" | "meta_ads";

export type ChannelStrategy = {
  channel: StrategyChannel;
  objective: string;
  targeting_summary: string;
  audience_parameters: string[];
  budget_recommendation_try: string;
  keywords: string[];
  negative_keywords: string[];
  headlines: string[];
  descriptions: string[];
  primary_text: string;
  call_to_action: string;
};

export type StrategyReport = {
  product_service: string;
  target_audience: string;
  website_url?: string;
  website_insights?: string;
  sector: string;
  executive_summary: string;
  channels: ChannelStrategy[];
  generated_at: string;
};

export type StrategyInput = {
  product_service: string;
  website_url?: string;
  industry_notes?: string;
  email?: string;
};

export const CHANNEL_LABELS: Record<StrategyChannel, string> = {
  google_ads: "Google Ads",
  linkedin_ads: "LinkedIn Ads",
  meta_ads: "Meta Ads",
};

export const CHANNEL_COLORS: Record<StrategyChannel, string> = {
  google_ads: "#4285F4",
  linkedin_ads: "#0A66C2",
  meta_ads: "#1877F2",
};
