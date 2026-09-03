const UNLOCK_KEY = "adorbit_strategy_report_unlock";
const EMAIL_KEY = "adorbit_strategy_report_email";

export function isStrategyReportUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.sessionStorage.getItem(UNLOCK_KEY) === "1" ||
    window.localStorage.getItem(UNLOCK_KEY) === "1"
  );
}

export function unlockStrategyReport(email: string): void {
  window.sessionStorage.setItem(UNLOCK_KEY, "1");
  window.localStorage.setItem(UNLOCK_KEY, "1");
  window.localStorage.setItem(EMAIL_KEY, email.trim());
}

export function getStrategyReportUnlockEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(EMAIL_KEY);
}
