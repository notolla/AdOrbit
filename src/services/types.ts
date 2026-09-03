export type CommercialIntent = "Yüksek" | "Orta" | "Düşük";

export type KeywordCompetition = "LOW" | "MEDIUM" | "HIGH" | "UNSPECIFIED";

export type KeywordDataSource = "google_ads_api" | "estimated";

export type KeywordReportEntry = {
  keyword: string;
  estimated_cpc_try: number;
  search_volume_monthly: number;
  commercial_intent: CommercialIntent;
  data_source?: KeywordDataSource;
  competition?: KeywordCompetition;
};

export type ResponsiveSearchAdCopy = {
  headlines: string[];
  descriptions: string[];
};

export type Campaign = {
  name: string;
  keywords: string[];
  negative_keywords: string[];
  rsa: ResponsiveSearchAdCopy;
};

export type WebsiteAnalysis = {
  sector: string;
  diagnosis_summary: string;
  campaigns: Campaign[];
  keyword_report: KeywordReportEntry[];
};

export type ScrapedPageData = {
  url: string;
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
};

export type AnalysisSnapshot = {
  id: string;
  version: number;
  website_url: string;
  email: string;
  sector: string;
  label: string;
  created_at: string;
  analysis: WebsiteAnalysis;
};

export type AnalysisSubmitPayload = {
  analysis: WebsiteAnalysis;
  website: string;
  email: string;
  snapshot: AnalysisSnapshot;
};
