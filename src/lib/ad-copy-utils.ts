import type { Campaign, ResponsiveSearchAdCopy, WebsiteAnalysis } from "@/services/types";

export const RSA_HEADLINE_MAX = 30;
export const RSA_DESCRIPTION_MAX = 90;
export const RSA_HEADLINE_COUNT = 15;
export const RSA_DESCRIPTION_COUNT = 4;

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max - 1).trimEnd() + "…";
}

function uniqueNonEmpty(items: string[]): string[] {
  const seen = new Set<string>();
  return items
    .map((item) => item.trim())
    .filter((item) => {
      if (!item) return false;
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function normalizeRsaCopy(copy: ResponsiveSearchAdCopy): ResponsiveSearchAdCopy {
  return {
    headlines: uniqueNonEmpty(copy.headlines)
      .slice(0, RSA_HEADLINE_COUNT)
      .map((h) => truncate(h, RSA_HEADLINE_MAX)),
    descriptions: uniqueNonEmpty(copy.descriptions)
      .slice(0, RSA_DESCRIPTION_COUNT)
      .map((d) => truncate(d, RSA_DESCRIPTION_MAX)),
  };
}

function buildFallbackRsa(campaign: Campaign, sector: string): ResponsiveSearchAdCopy {
  const primaryKeyword = campaign.keywords[0] ?? sector;
  const shortSector = truncate(sector, 20);

  const headlineTemplates = [
    `${shortSector} Hizmeti`,
    "Hemen Teklif Alın",
    "Uzman Ekip · Hızlı Dönüş",
    "Ücretsiz Ön Görüşme",
    "Güvenilir Çözüm Ortağı",
    "Aynı Gün Randevu",
    "Profesyonel Danışmanlık",
    "Şeffaf Fiyatlandırma",
    "Yerel Uzman Destek",
    truncate(primaryKeyword, RSA_HEADLINE_MAX),
    "Kaliteli Hizmet Garantisi",
    "Müşteri Memnuniyeti %98",
    "Online Randevu Alın",
    "Detaylı Bilgi İçin Tıkla",
    "Sektörünüze Özel Çözüm",
  ];

  const descriptionTemplates = [
    truncate(
      `${sector} alanında uzman ekibimizle hedef kitlenize ulaşın. Hemen teklif alın, farkı görün.`,
      RSA_DESCRIPTION_MAX,
    ),
    truncate(
      `${campaign.name} için optimize edilmiş reklam stratejisi. Güvenilir hizmet, şeffaf süreç.`,
      RSA_DESCRIPTION_MAX,
    ),
    truncate(
      "Profesyonel danışmanlık ve hızlı dönüş. Formu doldurun, size özel planı birlikte oluşturalım.",
      RSA_DESCRIPTION_MAX,
    ),
    truncate(
      "Yüksek niyetli anahtar kelimelerle bütçenizi koruyun. Google Ads uyumlu kampanya yapısı.",
      RSA_DESCRIPTION_MAX,
    ),
  ];

  return normalizeRsaCopy({
    headlines: headlineTemplates,
    descriptions: descriptionTemplates,
  });
}

export function ensureCampaignRsa(campaign: Campaign, sector: string): Campaign {
  const hasValidRsa =
    campaign.rsa?.headlines?.length >= RSA_HEADLINE_COUNT &&
    campaign.rsa?.descriptions?.length >= RSA_DESCRIPTION_COUNT;

  if (hasValidRsa) {
    return {
      ...campaign,
      rsa: normalizeRsaCopy(campaign.rsa),
    };
  }

  return {
    ...campaign,
    rsa: buildFallbackRsa(campaign, sector),
  };
}

export function ensureRsaCopy(analysis: WebsiteAnalysis): WebsiteAnalysis {
  return {
    ...analysis,
    campaigns: analysis.campaigns.map((campaign) => ensureCampaignRsa(campaign, analysis.sector)),
  };
}

export function copyRsaToClipboard(copy: ResponsiveSearchAdCopy): Promise<void> {
  const text = [
    "=== BAŞLIKLAR (RSA) ===",
    ...copy.headlines.map((h, i) => `${i + 1}. ${h}`),
    "",
    "=== AÇIKLAMALAR (RSA) ===",
    ...copy.descriptions.map((d, i) => `${i + 1}. ${d}`),
  ].join("\n");

  return navigator.clipboard.writeText(text);
}

function escapeCsvCell(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadRsaCsv(campaign: Campaign): void {
  const lines = [
    "Kampanya,Bölüm,Sıra,Metin,Karakter Limiti",
    ...campaign.rsa.headlines.map((headline, index) =>
      [
        escapeCsvCell(campaign.name),
        "Baslik",
        index + 1,
        escapeCsvCell(headline),
        RSA_HEADLINE_MAX,
      ].join(","),
    ),
    ...campaign.rsa.descriptions.map((description, index) =>
      [
        escapeCsvCell(campaign.name),
        "Aciklama",
        index + 1,
        escapeCsvCell(description),
        RSA_DESCRIPTION_MAX,
      ].join(","),
    ),
  ];

  const blob = new Blob(["\uFEFF" + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `google-ads-rsa-${campaign.name.replace(/\s+/g, "-").toLowerCase()}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
