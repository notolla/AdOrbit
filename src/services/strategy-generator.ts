import { z } from "zod";
import { UserFacingAnalysisError } from "./analysis-errors";
import { analyzeWebsiteForStrategy, type WebsiteStrategyContext } from "./strategy-website-context";
import type { StrategyInput, StrategyReport } from "./strategy-types";

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

const strategySchema = z.object({
  sector: z.string(),
  target_audience: z.string(),
  executive_summary: z.string(),
  channels: z.array(channelSchema).min(3),
});

const STRATEGY_JSON_SCHEMA = {
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

const MODELS = ["gemini-3.5-flash", "gemini-3.1-flash-lite"] as const;

const SYSTEM_PROMPT = `Sen B2B teknoloji ve siber güvenlik pazarında uzman bir performance marketing stratejistisin.
Google Ads, LinkedIn Ads ve Meta Ads kanallarında kampanya kurgularsın. Tüm çıktılar Türkçe olmalıdır.

Kurallar:
- Ürün/hizmet, web sitesi analizi ve sektör notlarına göre spesifik bir hedef kitle önerisi (target_audience) üret.
- target_audience: unvan/rol, sektör, şirket büyüklüğü, coğrafya ve satın alma niyeti içeren 1-2 cümlelik B2B tanım.
- Ürün/hizmet ve önerilen hedef kitleye göre spesifik, uygulanabilir strateji üret.
- Siber güvenlik / enterprise yazılım bağlamını dikkate al (Red Team, SIEM, sızma testi, EDR vb. örnekleri doğru konumlandır).
- Google Ads: arama niyeti, long-tail keywords, negatif kelimeler.
- LinkedIn Ads: job title, company size, sektör hedefleme parametreleri.
- Meta Ads: interest/behavior hedefleme, kreatif mesajlaşma, primary text.
- Her kanal için tahmini günlük bütçe aralığı TRY cinsinden metin olarak ver.
- Jenerik tek kelimelik anahtar kelimelerden kaçın.
- Tam 3 kanal döndür: google_ads, linkedin_ads, meta_ads (sıra önemli değil).`;

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
  const lines = [
    "Aşağıdaki girdiler için çok kanallı reklam stratejisi üret.",
    "Kullanıcı hedef kitle girmedi; target_audience alanında veriye dayalı bir hedef kitle önerisi sun.",
    "",
    `Ürün / Hizmet: ${input.product_service}`,
  ];

  if (input.industry_notes) {
    lines.push(`Ek Notlar: ${input.industry_notes}`);
  }

  if (websiteContext) {
    lines.push(
      "",
      "## Web sitesi analizi (otomatik)",
      `URL: ${websiteContext.url}`,
      websiteContext.page_title ? `Sayfa başlığı: ${websiteContext.page_title}` : "",
      `Özet: ${websiteContext.page_summary}`,
      `Tespit edilen ürün/hizmetler: ${websiteContext.detected_products_services.join(", ")}`,
      `Value proposition'lar: ${websiteContext.value_propositions.join("; ")}`,
      websiteContext.cybersecurity_solutions.length
        ? `Siber güvenlik çözümleri: ${websiteContext.cybersecurity_solutions.join(", ")}`
        : "",
      "",
      "Web sitesi içgörülerini stratejiye yansıt; manuel ürün/hizmet alanı ile çelişen noktada manuel girdiyi önceliklendir.",
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

async function requestStrategy(
  model: string,
  input: StrategyInput,
  apiKey: string,
  websiteContext?: WebsiteStrategyContext,
) {
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
        responseSchema: STRATEGY_JSON_SCHEMA,
      },
    }),
    signal: AbortSignal.timeout(45_000),
  });

  if (!response.ok) {
    throw new UserFacingAnalysisError(
      "Strateji motoru geçici olarak yanıt veremedi. Lütfen tekrar deneyin.",
    );
  }

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const content = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    throw new UserFacingAnalysisError("Strateji verisi oluşturulamadı.");
  }

  return strategySchema.parse(JSON.parse(content));
}

export async function generateStrategyReport(input: StrategyInput): Promise<StrategyReport> {
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
