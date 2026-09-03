import { z } from "zod";
import { UserFacingAnalysisError } from "./analysis-errors";
import { scrapeWebsite } from "./scrape-website";

export type WebsiteStrategyContext = {
  url: string;
  page_title: string | null;
  detected_products_services: string[];
  value_propositions: string[];
  cybersecurity_solutions: string[];
  page_summary: string;
};

const insightSchema = z.object({
  detected_products_services: z.array(z.string()).min(1),
  value_propositions: z.array(z.string()).min(1),
  cybersecurity_solutions: z.array(z.string()),
  page_summary: z.string(),
});

const EXTRACT_JSON_SCHEMA = {
  type: "OBJECT",
  properties: {
    detected_products_services: { type: "ARRAY", items: { type: "STRING" } },
    value_propositions: { type: "ARRAY", items: { type: "STRING" } },
    cybersecurity_solutions: { type: "ARRAY", items: { type: "STRING" } },
    page_summary: { type: "STRING" },
  },
  required: [
    "detected_products_services",
    "value_propositions",
    "cybersecurity_solutions",
    "page_summary",
  ],
} as const;

const EXTRACT_MODELS = ["gemini-3.5-flash", "gemini-3.1-flash-lite"] as const;

const EXTRACT_SYSTEM_PROMPT = `Sen B2B teknoloji ve siber güvenlik pazarlama analistisin.
Verilen web sitesi metinlerinden yapılandırılmış pazarlama içgörüsü çıkarırsın. Tüm çıktılar Türkçe olmalıdır.

Kurallar:
- detected_products_services: sitede sunulan ürün, hizmet veya çözüm adları (en az 1).
- value_propositions: müşteriye vaat edilen faydalar, farklılaştırıcı teklifler (en az 1).
- cybersecurity_solutions: siber güvenlik bağlamında tespit edilen çözümler (Red Team, SIEM, EDR, sızma testi vb.). Yoksa boş dizi döndür.
- page_summary: 2-3 cümlelik özet; sektör ve konumlandırma odaklı.
- Metinde olmayan bilgiyi uydurma; emin değilsen genel ifade kullan.`;

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

function buildExtractPrompt(scraped: Awaited<ReturnType<typeof scrapeWebsite>>): string {
  return [
    "Aşağıdaki web sitesi verilerinden pazarlama stratejisi için içgörü çıkar.",
    "",
    `URL: ${scraped.url}`,
    `Sayfa başlığı: ${scraped.title ?? "Bulunamadı"}`,
    `H1: ${scraped.h1 ?? "Bulunamadı"}`,
    `Meta açıklama: ${scraped.metaDescription ?? "Bulunamadı"}`,
    scraped.headings.length
      ? `H2 başlıkları: ${scraped.headings.join(" | ")}`
      : "H2 başlıkları: Bulunamadı",
    "",
    "Sayfa metni özeti:",
    scraped.bodySnippet ?? "Metin çıkarılamadı.",
  ].join("\n");
}

async function requestWebsiteInsights(
  model: string,
  scraped: Awaited<ReturnType<typeof scrapeWebsite>>,
  apiKey: string,
) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: EXTRACT_SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: buildExtractPrompt(scraped) }] }],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: EXTRACT_JSON_SCHEMA,
      },
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new UserFacingAnalysisError(
      "Web sitesi analizi geçici olarak yanıt veremedi. Lütfen tekrar deneyin.",
    );
  }

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const content = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    throw new UserFacingAnalysisError("Web sitesi içeriği analiz edilemedi.");
  }

  return insightSchema.parse(JSON.parse(content));
}

/** URL'den scrape + AI ile ürün/hizmet, value proposition ve siber güvenlik içgörüsü çıkarır. */
export async function analyzeWebsiteForStrategy(rawUrl: string): Promise<WebsiteStrategyContext> {
  const scraped = await scrapeWebsite(rawUrl);
  const apiKey = getApiKey();
  let lastError: unknown;

  for (const model of EXTRACT_MODELS) {
    try {
      const insights = await requestWebsiteInsights(model, scraped, apiKey);
      return {
        url: scraped.url,
        page_title: scraped.title,
        ...insights,
      };
    } catch (error) {
      lastError = error;
      console.error(`[strategy-website] ${model} failed`, error);
    }
  }

  if (lastError instanceof UserFacingAnalysisError) throw lastError;
  throw new UserFacingAnalysisError(
    "Web sitesi analiz edilemedi. Adresi kontrol edip tekrar deneyin.",
  );
}
