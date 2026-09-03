import type { StrategyChannel } from "@/services/strategy-types";

export type SelectOption = {
  id: string;
  label: string;
  description: string;
};

export const ONBOARDING_CHANNELS: Array<
  SelectOption & { id: StrategyChannel }
> = [
  {
    id: "google_ads",
    label: "Google Ads",
    description: "Arama niyeti, long-tail anahtar kelimeler ve dönüşüm odaklı kampanyalar.",
  },
  {
    id: "linkedin_ads",
    label: "LinkedIn Ads",
    description: "Unvan, sektör ve şirket büyüklüğüne göre B2B hedefleme.",
  },
  {
    id: "meta_ads",
    label: "Meta Ads",
    description: "Interest/behavior hedefleme ve kreatif mesajlaşma.",
  },
];

export const AUDIENCE_PROFILES: SelectOption[] = [
  {
    id: "owners",
    label: "Şirket Sahipleri / Genel Müdürler",
    description: "Stratejik karar vericiler, ROI ve büyüme odağı.",
  },
  {
    id: "c_level",
    label: "C-Level Yöneticiler",
    description: "CTO, CFO, CISO vb. — kurumsal satın alma süreçleri.",
  },
  {
    id: "operational",
    label: "Operasyonel Karar Vericiler",
    description: "IT, güvenlik, pazarlama operasyon ekipleri.",
  },
  {
    id: "b2c",
    label: "Bireysel Tüketiciler",
    description: "Doğrudan son kullanıcıya yönelik talep oluşturma.",
  },
];

export const GEO_SCOPES: SelectOption[] = [
  {
    id: "turkey",
    label: "Türkiye Pazarı",
    description: "Yerel dil, KVKK ve Türkiye CPC benchmark'ları.",
  },
  {
    id: "emea",
    label: "EMEA Bölgesi",
    description: "Avrupa, Orta Doğu ve Afrika pazarları.",
  },
  {
    id: "global",
    label: "Global (US/UK)",
    description: "Uluslararası İngilizce kampanya kurgusu.",
  },
];

export const CAMPAIGN_GOALS: SelectOption[] = [
  {
    id: "demo",
    label: "Demo / Toplantı Talebi",
    description: "Satış görüşmesi ve ürün demosu odaklı dönüşüm.",
  },
  {
    id: "mql",
    label: "Nitelikli Lead Toplama",
    description: "Form doldurma, whitepaper ve MQL üretimi.",
  },
  {
    id: "sales",
    label: "Doğrudan Satış",
    description: "E-ticaret veya self-serve satın alma niyeti.",
  },
  {
    id: "awareness",
    label: "Marka Bilinirliği",
    description: "Erişim, görüntülenme ve marka arama hacmi.",
  },
];

export const BUDGET_RANGES: SelectOption[] = [
  {
    id: "starter",
    label: "Başlangıç / Test",
    description: "Günlük ~500–2.000 TRY — pilot kampanya ve A/B test.",
  },
  {
    id: "growth",
    label: "Büyüme / Ölçekleme",
    description: "Günlük ~2.000–10.000 TRY — kanal optimizasyonu.",
  },
  {
    id: "enterprise",
    label: "Kurumsal / Yüksek Hacim",
    description: "Günlük 10.000+ TRY — çok kanallı agresif büyüme.",
  },
];

export const COMMUNICATION_TONES: SelectOption[] = [
  {
    id: "corporate",
    label: "Kurumsal / Güven Verici",
    description: "Resmi dil, uyumluluk ve güvenilirlik vurgusu.",
  },
  {
    id: "direct",
    label: "Doğrudan / Sonuç Odaklı",
    description: "Net CTA, fayda odaklı, kısa mesajlar.",
  },
  {
    id: "innovative",
    label: "Yenilikçi / Teknik",
    description: "Ürün derinliği, teknik diferansiyasyon.",
  },
];

export function labelForOption(options: SelectOption[], id: string): string {
  return options.find((item) => item.id === id)?.label ?? id;
}

export function labelForChannel(id: StrategyChannel): string {
  return ONBOARDING_CHANNELS.find((item) => item.id === id)?.label ?? id;
}
