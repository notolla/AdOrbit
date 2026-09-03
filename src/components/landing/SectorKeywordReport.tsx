import { Download } from "lucide-react";
import { useGoogleAdsConnection } from "@/contexts/GoogleAdsConnectionContext";
import { GoogleAdsPaywallOverlay } from "@/components/landing/GoogleAdsConnectCard";
import { toast } from "sonner";
import type { WebsiteAnalysis } from "@/services/types";
import { hasGoogleAdsKeywordData } from "@/services/keyword-enrichment";
import {
  downloadKeywordReportCsv,
  ensureKeywordReport,
  formatCpc,
  formatVolume,
} from "@/lib/keyword-report-utils";
import type { CommercialIntent } from "@/services/types";

type SectorKeywordReportProps = {
  analysis: WebsiteAnalysis;
};

const FREE_ROWS = 4;

const INTENT_STYLES: Record<
  CommercialIntent,
  { label: string; className: string }
> = {
  Yüksek: {
    label: "Yüksek",
    className: "border-[#34A853]/30 bg-[#34A853]/10 text-[#1e7e34]",
  },
  Orta: {
    label: "Orta",
    className: "border-[#FBBC05]/40 bg-[#FBBC05]/15 text-[#9a7200]",
  },
  Düşük: {
    label: "Düşük",
    className: "border-slate-300 bg-slate-100 text-slate-600",
  },
};

function lockedBlurClass(index: number, unlocked: boolean): string {
  if (unlocked || index < FREE_ROWS) return "";
  const depth = index - FREE_ROWS;
  if (depth === 0) return "blur-[2px] opacity-80";
  if (depth === 1) return "blur-[3px] opacity-65";
  return "blur-[5px] opacity-45";
}

function IntentBadge({ intent }: { intent: CommercialIntent }) {
  const style = INTENT_STYLES[intent];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${style.className}`}
    >
      {intent === "Düşük" ? (
        <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#EA4335]" />
      ) : null}
      {style.label}
    </span>
  );
}

export function SectorKeywordReport({ analysis }: SectorKeywordReportProps) {
  const { isConnected } = useGoogleAdsConnection();
  const unlocked = isConnected;
  const report = ensureKeywordReport(analysis).keyword_report;
  const highIntentCount = report.filter((row) => row.commercial_intent === "Yüksek").length;
  const hasLiveGoogleAdsData = hasGoogleAdsKeywordData(analysis);
  const hasLockedRows = report.length > FREE_ROWS;

  function handleDownload() {
    if (!unlocked) {
      toast.message("Tam raporu açarak CSV indirebilirsiniz.");
      return;
    }
    downloadKeywordReportCsv(analysis);
    toast.success("Anahtar kelime raporu CSV olarak indirildi.");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-900">{analysis.sector}</span> sektörü için{" "}
            {report.length} anahtar kelime analiz edildi · {highIntentCount} yüksek niyetli
          </p>
          {hasLiveGoogleAdsData ? (
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#34A853]/30 bg-[#34A853]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#1e7e34]">
              Google Ads Keyword Planner verisi
            </span>
          ) : (
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
              Tahmini benchmark verisi
            </span>
          )}
        </div>
        {unlocked ? (
          <button
            type="button"
            onClick={handleDownload}
            className="btn-secondary shrink-0 self-start"
          >
            <Download className="h-4 w-4" />
            Raporu Excel / CSV Olarak İndir
          </button>
        ) : null}
      </div>

      <div className="relative">
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/60">
                  <th className="px-5 py-3.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    Anahtar Kelime
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    Tahmini CPC
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    Arama Hacmi
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    Ticari Niyet
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60">
                {report.map((row, index) => (
                  <tr
                    key={row.keyword}
                    className={`transition-all duration-300 ${lockedBlurClass(index, unlocked)} ${!unlocked && index >= FREE_ROWS ? "select-none" : "hover:bg-slate-50/40"}`}
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-900">{row.keyword}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">
                      {formatCpc(row.estimated_cpc_try)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">
                      {formatVolume(row.search_volume_monthly)}
                      <span className="ml-1 text-xs text-slate-400">/ ay</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <IntentBadge intent={row.commercial_intent} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {!unlocked && hasLockedRows ? <GoogleAdsPaywallOverlay /> : null}
      </div>

      <p className="text-xs text-slate-500">
        {hasLiveGoogleAdsData
          ? "CPC ve arama hacmi Google Ads Keyword Planner API üzerinden çekilmiştir (Türkiye · Türkçe)."
          : "CPC ve arama hacmi sektör benchmark tahminidir. Google Ads hesabınızı bağlayarak gerçek Keyword Planner verisine geçebilirsiniz."}
      </p>
    </div>
  );
}
