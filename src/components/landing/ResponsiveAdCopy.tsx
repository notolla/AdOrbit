import { useState } from "react";
import { ArrowUpRight, Check, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGoogleAdsConnection } from "@/contexts/GoogleAdsConnectionContext";
import { GoogleAdsPaywallOverlay } from "@/components/landing/GoogleAdsConnectCard";
import { pushCampaignsToGoogleAds } from "@/lib/google-ads-connection";
import type { Campaign, WebsiteAnalysis } from "@/services/types";
import {
  RSA_DESCRIPTION_COUNT,
  RSA_HEADLINE_COUNT,
  copyRsaToClipboard,
  downloadRsaCsv,
} from "@/lib/ad-copy-utils";

type ResponsiveAdCopyProps = {
  campaigns: Campaign[];
  analysis: WebsiteAnalysis;
  websiteUrl: string;
};

const FREE_HEADLINES = 3;
const FREE_DESCRIPTIONS = 1;

function lockedBlurClass(index: number, freeLimit: number, unlocked: boolean): string {
  if (unlocked || index < freeLimit) return "";
  const depth = index - freeLimit;
  if (depth === 0) return "blur-[2px] opacity-80";
  if (depth === 1) return "blur-[3px] opacity-65";
  return "blur-[5px] opacity-45";
}

export function ResponsiveAdCopy({ campaigns, analysis, websiteUrl }: ResponsiveAdCopyProps) {
  const { isConnected, connect } = useGoogleAdsConnection();
  const unlocked = isConnected;
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const campaign = campaigns[activeIndex] ?? campaigns[0];

  if (!campaign) return null;

  async function handleCopy() {
    if (!unlocked) {
      toast.message("Tüm varyasyonları açarak kopyalayabilirsiniz.");
      return;
    }

    try {
      await copyRsaToClipboard(campaign.rsa);
      setCopied(true);
      toast.success("RSA metinleri panoya kopyalandı.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Kopyalama başarısız oldu.");
    }
  }

  function handleExportCsv() {
    if (!unlocked) {
      toast.message("CSV indirmek için Google Ads hesabınızı bağlayın.");
      return;
    }
    downloadRsaCsv(campaign);
    toast.success("Google Ads CSV dosyası indirildi.");
  }

  async function handlePushToGoogleAds() {
    if (!unlocked) {
      connect();
      return;
    }

    if (isPushing) return;

    setIsPushing(true);
    try {
      const result = await pushCampaignsToGoogleAds(analysis, websiteUrl);

      toast.success("Kampanya Google Ads'e aktarıldı", {
        description: `${result.stats.adGroups} reklam grubu · ${result.stats.keywords} anahtar kelime · duraklatılmış olarak oluşturuldu.`,
        duration: 12_000,
        action: {
          label: "Google Ads'de Görüntüle",
          onClick: () => window.open(result.viewUrl, "_blank", "noopener,noreferrer"),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Aktarım başarısız oldu.";
      toast.error(message);
    } finally {
      setIsPushing(false);
    }
  }

  return (
    <div className="space-y-5">
      {campaigns.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {campaigns.map((item, index) => (
            <button
              key={item.name}
              type="button"
              onClick={() => {
                setActiveIndex(index);
              }}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                index === activeIndex
                  ? "border-[#4285F4]/40 bg-[#4285F4]/8 text-[#4285F4]"
                  : "border-slate-200/80 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-900">{campaign.name}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            Google Responsive Search Ads · {RSA_HEADLINE_COUNT} başlık · {RSA_DESCRIPTION_COUNT}{" "}
            açıklama
          </p>
        </div>
        {unlocked ? (
          <button type="button" onClick={() => void handleCopy()} className="btn-secondary shrink-0">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Tümünü Kopyala
          </button>
        ) : null}
      </div>

      <div className="relative">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="surface-card overflow-hidden">
            <div className="border-b border-slate-200/80 bg-slate-50/60 px-5 py-3">
              <p className="section-label">Başlıklar ({RSA_HEADLINE_COUNT})</p>
              <p className="mt-0.5 text-[11px] text-slate-400">Maks. 30 karakter · RSA uyumlu</p>
            </div>
            <ol className="divide-y divide-slate-200/60">
              {campaign.rsa.headlines.map((headline, index) => (
                <li
                  key={`${headline}-${index}`}
                  className={`flex gap-3 px-5 py-3 transition-all duration-300 ${lockedBlurClass(index, FREE_HEADLINES, unlocked)} ${!unlocked && index >= FREE_HEADLINES ? "select-none" : ""}`}
                >
                  <span className="font-mono text-[11px] text-slate-400">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-900">{headline}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{headline.length}/30</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="surface-card overflow-hidden">
            <div className="border-b border-slate-200/80 bg-slate-50/60 px-5 py-3">
              <p className="section-label">Açıklamalar ({RSA_DESCRIPTION_COUNT})</p>
              <p className="mt-0.5 text-[11px] text-slate-400">Maks. 90 karakter · RSA uyumlu</p>
            </div>
            <ol className="divide-y divide-slate-200/60">
              {campaign.rsa.descriptions.map((description, index) => (
                <li
                  key={`${description}-${index}`}
                  className={`flex gap-3 px-5 py-3 transition-all duration-300 ${lockedBlurClass(index, FREE_DESCRIPTIONS, unlocked)} ${!unlocked && index >= FREE_DESCRIPTIONS ? "select-none" : ""}`}
                >
                  <span className="font-mono text-[11px] text-slate-400">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-relaxed text-slate-900">{description}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{description.length}/90</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {!unlocked ? <GoogleAdsPaywallOverlay /> : null}
      </div>

      <div className="space-y-4">
        <div className="surface-card border-[#4285F4]/20 bg-[#4285F4]/[0.03] p-5">
          <p className="section-label text-[#4285F4]">Google arama önizlemesi</p>
          <div className="mt-3 space-y-1">
            <p className="text-xs text-[#4285F4]">Reklam · example.com</p>
            <p className="font-display text-base text-[#1a0dab]">
              {campaign.rsa.headlines[0]} | {campaign.rsa.headlines[1]}
            </p>
            <p className="text-sm leading-relaxed text-slate-600">
              {campaign.rsa.descriptions[0]}
            </p>
          </div>
        </div>

        <div className="surface-card overflow-hidden border-[#34A853]/25 bg-gradient-to-br from-[#34A853]/[0.06] via-white to-[#4285F4]/[0.05] p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#4285F4]/20 bg-[#4285F4]/10">
              <ArrowUpRight className="h-4 w-4 text-[#4285F4]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">Google Ads&apos;e aktarmaya hazır</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Tüm kampanya grupları, anahtar kelimeler, negatifler ve RSA metinleri tek tıkla
                bağlı Google Ads hesabınıza gönderilir (duraklatılmış olarak).
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => void handlePushToGoogleAds()}
              disabled={isPushing}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#34A853]/35 bg-[#34A853] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#2d9249] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {isPushing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Google Ads&apos;e aktarılıyor…
                </>
              ) : (
                "Google Ads'e Aktar"
              )}
            </button>
            {unlocked ? (
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={isPushing}
                className="text-xs font-medium text-slate-500 underline-offset-2 transition-colors hover:text-slate-700 hover:underline disabled:opacity-60"
              >
                CSV olarak indir
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
