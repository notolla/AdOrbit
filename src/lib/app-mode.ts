export type AppMode = "standalone" | "live-api";

const STORAGE_KEY = "adorbit-app-mode";

export const APP_MODES: Record<
  AppMode,
  { label: string; shortLabel: string; description: string }
> = {
  standalone: {
    label: "Bağımsız Strateji ve Rapor Üretici",
    shortLabel: "Strateji Raporu",
    description:
      "API bağlantısı olmadan çok kanallı kampanya stratejisi, metinler ve PDF/UI raporu.",
  },
  "live-api": {
    label: "API Entegre Kampanya Yönetimi",
    shortLabel: "Canlı API",
    description:
      "Google Ads, Meta ve LinkedIn hesaplarını bağlayın; kampanyaları canlı hesaplara aktarın.",
  },
};

export function loadAppMode(): AppMode {
  if (typeof window === "undefined") return "standalone";

  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "live-api" ? "live-api" : "standalone";
}

export function saveAppMode(mode: AppMode): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, mode);
}
