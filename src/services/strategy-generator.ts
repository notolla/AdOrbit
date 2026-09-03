import { z } from "zod";
import { UserFacingAnalysisError } from "./analysis-errors";
import {
  labelForOption,
  AUDIENCE_PROFILES,
  BUDGET_RANGES,
  CAMPAIGN_GOALS,
  COMMUNICATION_TONES,
  GEO_SCOPES,
  labelForChannel,
} from "@/lib/onboarding-options";
import { analyzeWebsiteForStrategy, type WebsiteStrategyContext } from "./strategy-website-context";
import type { StrategyChannel, StrategyInput, StrategyReport } from "./strategy-types";

const channelSchema = z.object({
  channel: z.enum(["google_ads", "linkedin_ads", "meta_ads"]),
  objective: z.string(),
  targeting_summary: z.string(),
  audience_parameters: z.array(z.string()).min(2),
  budget_recommendation_try: z.string(),
  keywords: z.array(z.string()),
  negative_keywords: z.array(z.string()),
  headlines: z.array(z.string()).min(3),
  descriptions: z.array(z.string()).min(2),
  primary_text: z.string(),
  call_to_action: z.string(),
});

const MODELS = ["gemini-3.5-flash", "gemini-3.1-flash-lite"] as const;

const SYSTEM_PROMPT = `Sen kurumsal B2B pazarlama ve performance reklamcılık stratejistisin.
Google Ads, LinkedIn Ads ve Meta Ads kanallarında kampanya kurgularsın. Tüm çıktılar Türkçe olmalıdır.

Kurallar:
- Kullanıcının seçtiği kanallar, hedef kitle profili, coğrafya, KPI, bütçe seviyesi ve iletişim tonuna sadık kal.
- target_audience: seçilen profile ve coğrafyaya uygun 1-2 cümlelik net tanım.
- Her kanal için seçilen bütçe seviyesine uygun günlük TRY aralığı ver.
- Google Ads: long-tail keywords ve negatif kelimeler.
- LinkedIn Ads: unvan, şirket büyüklüğü, sektör parametreleri.
- Meta Ads: interest/behavior ve kreatif primary text.
- Jenerik tek kelimelik anahtar kelimelerden kaçın.
- Yalnızca istenen kanalları döndür; istenmeyen kanal ekleme.`;

function readEnv(name: string): string | undefined {
  if (typeof process !== "undefined" && process.env[name]) {
    return process.env[name];
  }
  const viteValue =
    typeof import.meta !== "undefined" && import.meta.env
      ? (import.meta.env[name as keyof ImportMetaEnv] as string | undefined)
      : undefined;
  return viteValue;
}

function getApiKey(): string {
  const key =
    readEnv("VITE_GOOGLE_AI_API_KEY") ??
    readEnv("GOOGLE_AI_API_KEY") ??
    readEnv("VITE_GOOGLE_AI_API_KEY_BACKUP") ??
    readEnv("GOOGLE_AI_API_KEY_BACKUP");

  if (!key) {
    throw new UserFacingAnalysisError(
      "Yapay zeka servisi yapılandırması eksik. Lütfen daha sonra tekrar deneyin.",
      false,
    );
  }

  return key;
}

function buildPrompt(input: StrategyInput, websiteContext?: WebsiteStrategyContext): string {
  const channelList = input.channels.map((c) => labelForChannel(c)).join(", ");

  const lines = [
    "Aşağıdaki onboarding girdileri için çok kanallı reklam stratejisi üret.",
    "",
    `Amiral gemisi ürün/hizmet: ${input.product_service}`,
    `Seçilen kanallar: ${channelList}`,
    `Hedef kitle profili: ${labelForOption(AUDIENCE_PROFILES, input.audience_profile)}`,
    `Coğrafi kapsam: ${labelForOption(GEO_SCOPES, input.geo_scope)}`,
    `Kampanya hedefi: ${labelForOption(CAMPAIGN_GOALS, input.campaign_goal)}`,
    `Bütçe seviyesi: ${labelForOption(BUDGET_RANGES, input.budget_range)}`,
    `İletişim tonu: ${labelForOption(COMMUNICATION_TONES, input.communication_tone)}`,
    "",
    `Yalnızca şu kanallar için strateji üret (tam ${input.channels.length} kanal): ${input.channels.join(", ")}`,
  ];

  if (input.industry_notes) {
    lines.push(`Ek notlar: ${input.industry_notes}`);
  }

  if (websiteContext) {
    lines.push(
      "",
      "## Web sitesi analizi",
      `URL: ${websiteContext.url}`,
      websiteContext.page_title ? `Başlık: ${websiteContext.page_title}` : "",
      `Özet: ${websiteContext.page_summary}`,
      `Ürün/hizmetler: ${websiteContext.detected_products_services.join(", ")}`,
      `Value proposition: ${websiteContext.value_propositions.join("; ")}`,
      websiteContext.cybersecurity_solutions.length
        ? `Siber güvenlik: ${websiteContext.cybersecurity_solutions.join(", ")}`
        : "",
    );
  }

  return lines.filter(Boolean).join("\n");
}

function formatWebsiteInsights(context: WebsiteStrategyContext): string {
  const parts = [
    context.page_summary,
    `Ürün/hizmet: ${context.detected_products_services.join(", ")}`,
    `Teklifler: ${context.value_propositions.join("; ")}`,
  ];
  if (context.cybersecurity_solutions.length) {
    parts.push(`Siber güvenlik: ${context.cybersecurity_solutions.join(", ")}`);
  }
  return parts.join(" · ");
}

function buildStrategySchema(channelCount: number) {
  return z.object({
    sector: z.string(),
    target_audience: z.string(),
    executive_summary: z.string(),
    channels: z.array(channelSchema).length(channelCount),
  });
}

function buildJsonSchema() {
  return {
    type: "OBJECT",
    properties: {
      sector: { type: "STRING" },
      target_audience: { type: "STRING" },
      executive_summary: { type: "STRING" },
      channels: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            channel: { type: "STRING" },
            objective: { type: "STRING" },
            targeting_summary: { type: "STRING" },
            audience_parameters: { type: "ARRAY", items: { type: "STRING" } },
            budget_recommendation_try: { type: "STRING" },
            keywords: { type: "ARRAY", items: { type: "STRING" } },
            negative_keywords: { type: "ARRAY", items: { type: "STRING" } },
            headlines: { type: "ARRAY", items: { type: "STRING" } },
            descriptions: { type: "ARRAY", items: { type: "STRING" } },
            primary_text: { type: "STRING" },
            call_to_action: { type: "STRING" },
          },
          required: [
            "channel",
            "objective",
            "targeting_summary",
            "audience_parameters",
            "budget_recommendation_try",
            "keywords",
            "negative_keywords",
            "headlines",
            "descriptions",
            "primary_text",
            "call_to_action",
          ],
        },
      },
    },
    required: ["sector", "target_audience", "executive_summary", "channels"],
  } as const;
}

async function requestStrategy(
  model: string,
  input: StrategyInput,
  apiKey: string,
  websiteContext?: WebsiteStrategyContext,
) {
  const schema = buildStrategySchema(input.channels.length);
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: buildPrompt(input, websiteContext) }] }],
      generationConfig: {
        temperature: 0.45,
        responseMimeType: "application/json",
        responseSchema: buildJsonSchema(),
      },
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    throw new UserFacingAnalysisError(
      "Strateji motoru geçici olarak yanıt vermedi. Lütfen tekrar deneyin.",
    );
  }

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const content = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    throw new UserFacingAnalysisError("Strateji verisi oluşturulamadı.");
  }

  const parsed = schema.parse(JSON.parse(content));
  const allowed = new Set(input.channels);
  const filtered = parsed.channels.filter((item) => allowed.has(item.channel));

  if (filtered.length !== input.channels.length) {
    throw new UserFacingAnalysisError("Kanal stratejileri eksik üretildi. Lütfen tekrar deneyin.");
  }

  return { ...parsed, channels: filtered };
}

export async function generateStrategyReport(input: StrategyInput): Promise<StrategyReport> {
  if (input.channels.length === 0) {
    throw new UserFacingAnalysisError("En az bir yayın kanalı seçilmelidir.");
  }

  const apiKey = getApiKey();
  let websiteContext: WebsiteStrategyContext | undefined;
  const websiteUrl = input.website_url?.trim();

  if (websiteUrl) {
    websiteContext = await analyzeWebsiteForStrategy(websiteUrl);
  }

  let lastError: unknown;

  for (const model of MODELS) {
    try {
      const parsed = await requestStrategy(model, input, apiKey, websiteContext);
      return {
        product_service: input.product_service,
        target_audience: parsed.target_audience,
        website_url: websiteContext?.url,
        website_insights: websiteContext ? formatWebsiteInsights(websiteContext) : undefined,
        brief: {
          audience_profile: input.audience_profile,
          geo_scope: input.geo_scope,
          campaign_goal: input.campaign_goal,
          budget_range: input.budget_range,
          communication_tone: input.communication_tone,
          channels: input.channels,
        },
        sector: parsed.sector,
        executive_summary: parsed.executive_summary,
        channels: parsed.channels,
        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      lastError = error;
      console.error(`[strategy] ${model} failed`, error);
    }
  }

  if (lastError instanceof UserFacingAnalysisError) throw lastError;
  throw new UserFacingAnalysisError("Strateji raporu oluşturulamadı. Lütfen tekrar deneyin.");
}
