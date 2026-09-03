import { z } from "zod";
import { ensureKeywordReport } from "@/lib/keyword-report-utils";
import { ensureRsaCopy } from "@/lib/ad-copy-utils";
import { UserFacingAnalysisError } from "./analysis-errors";
import type { ScrapedPageData, WebsiteAnalysis } from "./types";

export type AnalysisTier = "primary" | "fallback";

const commercialIntentSchema = z.enum(["Yüksek", "Orta", "Düşük"]);

const keywordReportEntrySchema = z.object({
  keyword: z.string(),
  estimated_cpc_try: z.number(),
  search_volume_monthly: z.number(),
  commercial_intent: commercialIntentSchema,
});

const rsaSchema = z.object({
  headlines: z.array(z.string()),
  descriptions: z.array(z.string()),
});

const campaignSchema = z.object({
  name: z.string(),
  keywords: z.array(z.string()),
  negative_keywords: z.array(z.string()),
  rsa: rsaSchema.optional(),
});

const analysisSchema = z.object({
  sector: z.string(),
  diagnosis_summary: z.string(),
  campaigns: z.array(campaignSchema).min(1),
  keyword_report: z.array(keywordReportEntrySchema).optional(),
});

const ANALYSIS_JSON_SCHEMA = {
  type: "OBJECT",
  properties: {
    sector: { type: "STRING" },
    diagnosis_summary: { type: "STRING" },
    campaigns: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          keywords: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
          negative_keywords: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
        },
        required: ["name", "keywords", "negative_keywords"],
      },
    },
  },
  required: ["sector", "diagnosis_summary", "campaigns"],
} as const;

/** Hızlı ana model — tek deneme */
const PRIMARY_MODELS = ["gemini-3.5-flash"] as const;

/** Yedek hafif model */
const FALLBACK_MODELS = ["gemini-3.1-flash-lite", "gemini-3.5-flash"] as const;

const RETRYABLE_STATUSES = new Set([429, 500, 503, 504]);
const MAX_ATTEMPTS_PER_MODEL = 1;
const REQUEST_TIMEOUT_MS = 30_000;

const SYSTEM_PROMPT = `Sen Türkiye pazarında 10+ yıl deneyimli, sertifikalı bir Google Ads uzmanısın. Her sektör için web sitesi verilerini analiz ederek yüksek dönüşüm potansiyelli arama kampanyaları kurgularsın. Tüm çıktılar Türkçe olmalıdır.

## Temel Kurallar

### 1. Jenerik Kelimeler Yasak
- Asla tek kelimelik veya aşırı genel terimler üretme.
- Yasak örnekler: "ayakkabı", "güvenlik", "mimarlık", "diş", "yazılım", "mobilya".
- Her anahtar kelime en az 2-3 kelimeden oluşmalı ve spesifik bir niyet taşımalıdır.

### 2. Ticari Niyet (High-Intent)
- Kullanıcının satın alma, randevu alma veya hizmet talep etme niyetini gösteren uzun kuyruklu (long-tail) ifadeler seç.

### 3. Sektörel Çeşitlilik
- E-ticaret siteleri: ürün ve kategori bazlı kampanyalar kurgula.
- B2B / hizmet siteleri: kurumsal acı noktalarına odaklan.

### 4. Negatif Kelimeler
- Her kampanya için bütçe yakacak, amaca uygun olmayan en az 5 negatif kelime üret.

## Çıktı Kalitesi
- sector: net ve spesifik sektör etiketi
- diagnosis_summary: 1-2 cümlelik profesyonel teşhis
- campaigns: tam 3 kampanya; her biri name, keywords (en az 3), negative_keywords (en az 5) içermeli`;

function readEnv(name: string): string | undefined {
  const viteValue =
    typeof import.meta !== "undefined" && import.meta.env
      ? (import.meta.env[name as keyof ImportMetaEnv] as string | undefined)
      : undefined;

  return viteValue ?? process.env[name];
}

function getApiKeys(): { primary: string; backup: string | null } {
  const primary =
    readEnv("VITE_GOOGLE_AI_API_KEY") ??
    readEnv("GOOGLE_AI_API_KEY");

  const backup =
    readEnv("VITE_GOOGLE_AI_API_KEY_BACKUP") ??
    readEnv("GOOGLE_AI_API_KEY_BACKUP") ??
    null;

  if (!primary && !backup) {
    throw new UserFacingAnalysisError(
      "Yapay zeka servisi yapılandırması eksik. Lütfen daha sonra tekrar deneyin.",
      false,
    );
  }

  return {
    primary: primary ?? backup!,
    backup: backup && backup !== primary ? backup : null,
  };
}

function buildPrompt(page: ScrapedPageData): string {
  return [
    "Aşağıdaki web sitesi verilerini profesyonel bir Google Ads uzmanı perspektifiyle analiz et.",
    "Tam 3 adet kampanya öner (sadece sector, diagnosis_summary, campaigns döndür).",
    "",
    `URL: ${page.url}`,
    `Sayfa başlığı (title): ${page.title ?? "Bulunamadı"}`,
    `H1: ${page.h1 ?? "Bulunamadı"}`,
    `Meta açıklama: ${page.metaDescription ?? "Bulunamadı"}`,
    "",
    "Kontrol listesi:",
    "- Anahtar kelimeler long-tail ve yüksek ticari niyetli mi?",
    "- Jenerik tek kelimelik terim kullanılmadı mı?",
    "- Sektör tipine (e-ticaret / B2B / hizmet) uygun strateji uygulandı mı?",
    "- Her kampanyada en az 5 bütçe koruyucu negatif kelime var mı?",
  ].join("\n");
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(error: unknown): boolean {
  const status = (error as Error & { status?: number }).status;
  if (status && RETRYABLE_STATUSES.has(status)) return true;

  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes("timeout") ||
    message.includes("aborted") ||
    message.includes("network") ||
    message.includes("fetch failed") ||
    message.includes("econnreset")
  );
}

async function requestGeminiModel(
  model: string,
  page: ScrapedPageData,
  apiKey: string,
): Promise<WebsiteAnalysis> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: buildPrompt(page) }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: "application/json",
          responseSchema: ANALYSIS_JSON_SCHEMA,
        },
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const wrapped = new Error(
      error instanceof Error ? error.message : "Gemini API bağlantı hatası",
    );
    (wrapped as Error & { status?: number }).status = 504;
    throw wrapped;
  }

  if (!response.ok) {
    const errorBody = await response.text();
    const wrapped = new Error(`Gemini HTTP ${response.status}: ${errorBody.slice(0, 200)}`);
    (wrapped as Error & { status?: number }).status = response.status;
    throw wrapped;
  }

  let payload: {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  try {
    payload = (await response.json()) as typeof payload;
  } catch {
    throw new UserFacingAnalysisError(
      "Yapay zeka yanıtı işlenemedi. Lütfen tekrar deneyin.",
    );
  }

  const content = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    throw new UserFacingAnalysisError(
      "Yapay zeka boş yanıt döndürdü. Lütfen tekrar deneyin.",
    );
  }

  try {
    const parsed = analysisSchema.parse(JSON.parse(content));
    return ensureRsaCopy(
      ensureKeywordReport({
        ...parsed,
        keyword_report: parsed.keyword_report ?? [],
      }),
    );
  } catch (parseError) {
    console.error("[gemini] JSON parse failed:", parseError);
    throw new UserFacingAnalysisError(
      "Kampanya verisi oluşturulamadı. Lütfen tekrar deneyin.",
    );
  }
}

async function runModelChain(
  page: ScrapedPageData,
  apiKey: string,
  models: readonly string[],
): Promise<WebsiteAnalysis> {
  let lastError: unknown = null;

  for (const model of models) {
    for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_MODEL; attempt++) {
      try {
        return await requestGeminiModel(model, page, apiKey);
      } catch (error) {
        lastError = error;
        console.error(`[gemini] ${model} attempt ${attempt + 1} failed`);

        if (isRetryable(error) && attempt < MAX_ATTEMPTS_PER_MODEL - 1) {
          await wait(1000 * (attempt + 1));
          continue;
        }

        break;
      }
    }
  }

  throw lastError ?? new UserFacingAnalysisError("Gemini analizi tamamlanamadı.");
}

async function runTier(
  page: ScrapedPageData,
  tier: AnalysisTier,
  keys: { primary: string; backup: string | null },
): Promise<WebsiteAnalysis> {
  const models = tier === "primary" ? PRIMARY_MODELS : FALLBACK_MODELS;
  const apiKey = tier === "primary" ? keys.primary : (keys.backup ?? keys.primary);

  return runModelChain(page, apiKey, models);
}

export async function analyzeWithGoogleAI(
  page: ScrapedPageData,
  tier: AnalysisTier = "primary",
): Promise<WebsiteAnalysis> {
  const keys = getApiKeys();

  try {
    return await runTier(page, tier, keys);
  } catch (error) {
    console.error(`[gemini] ${tier} pipeline failed:`, error);
    throw toFailoverError(error);
  }
}

function toFailoverError(error: unknown): UserFacingAnalysisError {
  if (error instanceof UserFacingAnalysisError) {
    return error;
  }

  const status = (error as Error & { status?: number }).status;
  if (status === 429) {
    return new UserFacingAnalysisError(
      "Analiz servisi kota limitine ulaştı. Lütfen birkaç dakika sonra tekrar deneyin.",
    );
  }

  if (status === 503 || status === 504) {
    return new UserFacingAnalysisError(
      "Analiz servisi geçici olarak yoğun. Lütfen tekrar deneyin.",
    );
  }

  return new UserFacingAnalysisError(
    "Kampanya analizi tamamlanamadı. Lütfen birkaç saniye sonra tekrar deneyin.",
  );
}
