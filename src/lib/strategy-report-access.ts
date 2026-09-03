const UNLOCKED_REPORT_KEY = "adorbit_strategy_report_unlocked_id";
const EMAIL_KEY = "adorbit_strategy_report_email";

/** Eski kalıcı kilidi temizler (önceki sürüm localStorage kullanıyordu). */
export function clearLegacyStrategyReportUnlock(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("adorbit_strategy_report_unlock");
  window.localStorage.removeItem(EMAIL_KEY);
}

export function isStrategyReportUnlocked(reportId: string): boolean {
  if (typeof window === "undefined") return false;
  clearLegacyStrategyReportUnlock();
  return window.sessionStorage.getItem(UNLOCKED_REPORT_KEY) === reportId;
}

export function unlockStrategyReport(reportId: string, email: string): void {
  window.sessionStorage.setItem(UNLOCKED_REPORT_KEY, reportId);
  window.sessionStorage.setItem(EMAIL_KEY, email.trim());
}

export function getStrategyReportUnlockEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(EMAIL_KEY);
}
