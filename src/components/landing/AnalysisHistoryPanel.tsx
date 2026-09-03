import { Clock, History, RotateCcw } from "lucide-react";
import type { AnalysisSnapshot } from "@/services/types";
import { formatRelativeDate, formatSnapshotDate } from "@/lib/analysis-history";

type AnalysisHistoryPanelProps = {
  history: AnalysisSnapshot[];
  activeSnapshotId?: string | null;
  onRestore: (snapshot: AnalysisSnapshot) => void;
  compact?: boolean;
};

export function AnalysisHistoryPanel({
  history,
  activeSnapshotId,
  onRestore,
  compact = false,
}: AnalysisHistoryPanelProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <section
      className={
        compact
          ? "mt-6"
          : "border-b border-slate-200/60 bg-surface py-12 sm:py-16"
      }
    >
      <div className={compact ? "" : "mx-auto max-w-5xl px-5"}>
        <header className="mb-4 flex items-center gap-2">
          <History className="h-4 w-4 text-[#4285F4]" />
          <div>
            <p className="section-label">Geçmiş analiz arşivi</p>
            {!compact ? (
              <p className="mt-1 text-sm text-slate-600">
                Daha önce oluşturduğunuz kampanya revizyonlarına tek tıkla dönün.
              </p>
            ) : null}
          </div>
        </header>

        <div className="space-y-2">
          {history.map((snapshot) => {
            const isActive = snapshot.id === activeSnapshotId;

            return (
              <button
                key={snapshot.id}
                type="button"
                onClick={() => onRestore(snapshot)}
                className={`surface-card flex w-full items-start justify-between gap-4 p-4 text-left transition-colors hover:border-slate-300 ${
                  isActive ? "border-[#4285F4]/30 bg-[#4285F4]/[0.03]" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{snapshot.label}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">{snapshot.website_url}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span className="pill-badge">{snapshot.sector}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeDate(snapshot.created_at)}
                    </span>
                    <span>v{snapshot.version}</span>
                  </div>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                    isActive
                      ? "border-[#34A853]/30 bg-[#34A853]/10 text-[#1e7e34]"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {isActive ? (
                    <>Aktif revizyon</>
                  ) : (
                    <>
                      <RotateCcw className="h-3 w-3" />
                      Geri yükle
                    </>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {!compact ? (
          <p className="mt-4 text-xs text-slate-500">
            Arşiv tarayıcınızda güvenle saklanır · {formatSnapshotDate(history[0]?.created_at ?? "")}{" "}
            itibarıyla {history.length} kayıt
          </p>
        ) : null}
      </div>
    </section>
  );
}
