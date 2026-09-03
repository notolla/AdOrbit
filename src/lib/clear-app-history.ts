import { clearAnalysisHistory } from "@/lib/analysis-history";
import { clearAnalysisSession } from "@/lib/analysis-session";
import { clearStrategyReportUnlock } from "@/lib/strategy-report-access";

/** Analiz arşivi, oturum ve rapor paywall kilidini temizler. */
export function clearAppHistory(): void {
  clearAnalysisHistory();
  clearAnalysisSession();
  clearStrategyReportUnlock();
}
