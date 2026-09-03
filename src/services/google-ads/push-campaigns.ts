import type { WebsiteAnalysis } from "@/services/types";
import { buildGoogleAdsCampaignUrl, googleAdsPost, resourceId } from "./api-client";

const GEO_TURKEY = "geoTargetConstants/2792";
const LANGUAGE_TR = "languageConstants/1037";
const DEFAULT_DAILY_BUDGET_TRY = 50;
const MAX_OPERATIONS_PER_REQUEST = 900;

type MutateOperation = Record<string, unknown>;

type MutateResponse = {
  mutateOperationResponses?: Array<Record<string, { resourceName?: string }>>;
};

export type PushCampaignsInput = {
  analysis: WebsiteAnalysis;
  websiteUrl: string;
};

export type PushCampaignsResult = {
  success: true;
  campaignId: string;
  campaignResourceName: string;
  customerId: string;
  viewUrl: string;
  stats: {
    adGroups: number;
    keywords: number;
    negativeKeywords: number;
    responsiveSearchAds: number;
  };
};

function normalizeFinalUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    throw new Error("Geçerli bir web sitesi URL'si gerekli.");
  }
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function sanitizeName(value: string, maxLength = 255): string {
  return value.replace(/[^\p{L}\p{N}\s\-_.|]/gu, "").trim().slice(0, maxLength) || "AdBuilder Kampanya";
}

function truncateText(value: string, maxLength: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength).trim();
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = value.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildBudgetMicros(): string {
  const fromEnv = Number(process.env.GOOGLE_ADS_DEFAULT_DAILY_BUDGET_TRY);
  const dailyTry =
    Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : DEFAULT_DAILY_BUDGET_TRY;
  return String(Math.round(dailyTry * 1_000_000));
}

function buildStructureOperations(
  config: GoogleAdsConfig,
  analysis: WebsiteAnalysis,
  finalUrl: string,
  timestamp: number,
): { operations: MutateOperation[] } {
  const customerId = config.customerId;
  const budgetTempId = -1;
  const campaignTempId = -2;
  const operations: MutateOperation[] = [];

  operations.push({
    campaignBudgetOperation: {
      create: {
        resourceName: `customers/${customerId}/campaignBudgets/${budgetTempId}`,
        name: `AdBuilder · ${sanitizeName(analysis.sector, 80)} · ${timestamp}`,
        amountMicros: buildBudgetMicros(),
        deliveryMethod: "STANDARD",
        explicitlyShared: false,
      },
    },
  });

  operations.push({
    campaignOperation: {
      create: {
        resourceName: `customers/${customerId}/campaigns/${campaignTempId}`,
        name: `AdBuilder · ${sanitizeName(analysis.sector, 120)} · ${timestamp}`,
        advertisingChannelType: "SEARCH",
        status: "PAUSED",
        campaignBudget: `customers/${customerId}/campaignBudgets/${budgetTempId}`,
        manualCpc: {},
        networkSettings: {
          targetGoogleSearch: true,
          targetSearchNetwork: true,
          targetContentNetwork: false,
          targetPartnerSearchNetwork: false,
        },
        containsEuPoliticalAdvertising: "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
      },
    },
  });

  operations.push({
    campaignCriterionOperation: {
      create: {
        campaign: `customers/${customerId}/campaigns/${campaignTempId}`,
        location: {
          geoTargetConstant: GEO_TURKEY,
        },
      },
    },
  });

  operations.push({
    campaignCriterionOperation: {
      create: {
        campaign: `customers/${customerId}/campaigns/${campaignTempId}`,
        language: {
          languageConstant: LANGUAGE_TR,
        },
      },
    },
  });

  const negativeKeywords = uniqueStrings(
    analysis.campaigns.flatMap((item) => item.negative_keywords),
  );

  for (const keyword of negativeKeywords) {
    operations.push({
      campaignCriterionOperation: {
        create: {
          campaign: `customers/${customerId}/campaigns/${campaignTempId}`,
          negative: true,
          keyword: {
            text: truncateText(keyword, 80),
            matchType: "BROAD",
          },
        },
      },
    });
  }

  analysis.campaigns.forEach((campaign, index) => {
    const adGroupTempId = -(100 + index);

    operations.push({
      adGroupOperation: {
        create: {
          resourceName: `customers/${customerId}/adGroups/${adGroupTempId}`,
          campaign: `customers/${customerId}/campaigns/${campaignTempId}`,
          name: sanitizeName(campaign.name, 120),
          status: "PAUSED",
          type: "SEARCH_STANDARD",
        },
      },
    });

    const keywords = uniqueStrings(campaign.keywords);
    for (const keyword of keywords) {
      operations.push({
        adGroupCriterionOperation: {
          create: {
            adGroup: `customers/${customerId}/adGroups/${adGroupTempId}`,
            status: "ENABLED",
            keyword: {
              text: truncateText(keyword, 80),
              matchType: "PHRASE",
            },
          },
        },
      });
    }

    const headlines = uniqueStrings(campaign.rsa.headlines)
      .slice(0, 15)
      .map((text) => ({ text: truncateText(text, 30) }))
      .filter((item) => item.text.length > 0);

    const descriptions = uniqueStrings(campaign.rsa.descriptions)
      .slice(0, 4)
      .map((text) => ({ text: truncateText(text, 90) }))
      .filter((item) => item.text.length > 0);

    while (headlines.length < 3) {
      headlines.push({ text: truncateText(campaign.name, 30) || "AdBuilder AI" });
    }
    while (descriptions.length < 2) {
      descriptions.push({
        text: truncateText(analysis.diagnosis_summary, 90) || "Profesyonel Google Ads kampanyası.",
      });
    }

    operations.push({
      adGroupAdOperation: {
        create: {
          adGroup: `customers/${customerId}/adGroups/${adGroupTempId}`,
          status: "PAUSED",
          ad: {
            finalUrls: [finalUrl],
            responsiveSearchAd: {
              headlines,
              descriptions,
            },
          },
        },
      },
    });
  });

  return { operations };
}

function countStats(analysis: WebsiteAnalysis) {
  const negativeKeywords = uniqueStrings(
    analysis.campaigns.flatMap((item) => item.negative_keywords),
  ).length;

  const keywords = analysis.campaigns.reduce(
    (sum, item) => sum + uniqueStrings(item.keywords).length,
    0,
  );

  return {
    adGroups: analysis.campaigns.length,
    keywords,
    negativeKeywords,
    responsiveSearchAds: analysis.campaigns.length,
  };
}

async function mutateInChunks(config: GoogleAdsConfig, operations: MutateOperation[]) {
  const responses: MutateResponse[] = [];

  for (let index = 0; index < operations.length; index += MAX_OPERATIONS_PER_REQUEST) {
    const chunk = operations.slice(index, index + MAX_OPERATIONS_PER_REQUEST);
    const response = await googleAdsPost<MutateResponse>(config, "googleAds:mutate", {
      mutateOperations: chunk,
      partialFailure: false,
      validateOnly: false,
    });
    responses.push(response);
  }

  return responses;
}

function extractCampaignResourceName(responses: MutateResponse[]): string | null {
  for (const response of responses) {
    for (const item of response.mutateOperationResponses ?? []) {
      const resourceName = item.campaignResult?.resourceName;
      if (resourceName) return resourceName;
    }
  }
  return null;
}

export async function pushCampaignsToGoogleAds(
  config: GoogleAdsConfig,
  input: PushCampaignsInput,
): Promise<PushCampaignsResult> {
  if (input.analysis.campaigns.length === 0) {
    throw new Error("Aktarılacak kampanya bulunamadı.");
  }

  const finalUrl = normalizeFinalUrl(input.websiteUrl);
  const timestamp = Date.now();
  const { operations } = buildStructureOperations(
    config,
    input.analysis,
    finalUrl,
    timestamp,
  );

  const responses = await mutateInChunks(config, operations);
  const campaignResourceName = extractCampaignResourceName(responses);

  if (!campaignResourceName) {
    throw new Error("Kampanya oluşturuldu ancak kampanya kimliği alınamadı.");
  }

  const campaignId = resourceId(campaignResourceName);

  return {
    success: true,
    campaignId,
    campaignResourceName,
    customerId: config.customerId,
    viewUrl: buildGoogleAdsCampaignUrl(config.customerId, campaignId),
    stats: countStats(input.analysis),
  };
}
