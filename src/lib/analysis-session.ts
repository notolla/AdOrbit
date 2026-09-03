import type { AnalysisSnapshot, WebsiteAnalysis } from "@/services/types";

const SESSION_KEY = "adbuilder-active-analysis-session";

export type AnalysisSession = {
  analysis: WebsiteAnalysis;
  snapshot: AnalysisSnapshot | null;
  websiteUrl: string;
  email: string;
};

export function saveAnalysisSession(session: AnalysisSession): void {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // sessionStorage full or unavailable
  }
}

export function loadAnalysisSession(): AnalysisSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AnalysisSession;
  } catch {
    return null;
  }
}

export function clearAnalysisSession(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_KEY);
}
