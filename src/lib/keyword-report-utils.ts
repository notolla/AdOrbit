import type { CommercialIntent, KeywordReportEntry, WebsiteAnalysis } from "./types";

const INTENT_BY_INDEX: CommercialIntent[] = ["Yüksek", "Orta", "Düşük"];

function estimateCpc(keyword: string, intent: CommercialIntent): number {
  const base = intent === "Yüksek" ? 12 : intent === "Orta" ? 7 : 4;
  const lengthFactor = Math.min(keyword.split(/\s+/).length * 1.5, 6);
  return Math.round((base + lengthFactor) * 10) / 10;
}

function estimateVolume(keyword: string, intent: CommercialIntent): number {
  const base = intent === "Yüksek" ? 880 : intent === "Orta" ? 1400 : 3200;
  const wordCount = keyword.split(/\s+/).length;
  return Math.round(base / Math.max(wordCount - 1, 1));
}

function inferIntent(keyword: string, index: number): CommercialIntent {
  const lower = keyword.toLowerCase();
  if (
    /(satın|fiyat|ücret|randevu|sipariş|teklif|near me|yakınımda|online|acil|hemen)/.test(
      lower,
    )
  ) {
    return "Yüksek";
  }
  if (/(nedir|nasıl|örnek|ücretsiz|bedava|pdf|wiki|anlamı)/.test(lower)) {
    return "Düşük";
  }
  return INTENT_BY_INDEX[index % 3];
}

export function buildKeywordReportEntry(keyword: string, index: number): KeywordReportEntry {
  const commercial_intent = inferIntent(keyword, index);
  return {
    keyword,
    estimated_cpc_try: estimateCpc(keyword, commercial_intent),
    search_volume_monthly: estimateVolume(keyword, commercial_intent),
    commercial_intent,
    data_source: "estimated",
  };
}

export function buildKeywordReportFromCampaigns(analysis: WebsiteAnalysis): KeywordReportEntry[] {
  const seen = new Set<string>();

  return analysis.campaigns.flatMap((campaign) =>
    campaign.keywords
      .filter((keyword) => {
        const key = keyword.trim().toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((keyword, index) => buildKeywordReportEntry(keyword, index)),
  );
}

export function ensureKeywordReport(analysis: WebsiteAnalysis): WebsiteAnalysis {
  if (analysis.keyword_report?.length) {
    return analysis;
  }

  return {
    ...analysis,
    keyword_report: buildKeywordReportFromCampaigns(analysis),
  };
}

function escapeCsvCell(value: string | number): string {
  const text = String(value);
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function downloadKeywordReportCsv(analysis: WebsiteAnalysis): void {
  const rows = ensureKeywordReport(analysis).keyword_report;
  const headers = [
    "Anahtar Kelime",
    "Tahmini CPC (TRY)",
    "Aylık Arama Hacmi",
    "Ticari Niyet Skoru",
    "Veri Kaynağı",
    "Rekabet",
    "Sektör",
  ];

  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      [
        escapeCsvCell(row.keyword),
        escapeCsvCell(row.estimated_cpc_try),
        escapeCsvCell(row.search_volume_monthly),
        escapeCsvCell(row.commercial_intent),
        escapeCsvCell(row.data_source ?? "estimated"),
        escapeCsvCell(row.competition ?? ""),
        escapeCsvCell(analysis.sector),
      ].join(","),
    ),
  ];

  const blob = new Blob(["\uFEFF" + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `sektorel-anahtar-kelime-raporu-${Date.now()}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function formatCpc(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatVolume(value: number): string {
  return new Intl.NumberFormat("tr-TR").format(value);
}
