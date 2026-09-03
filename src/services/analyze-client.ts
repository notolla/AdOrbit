import type { WebsiteAnalysis } from "./types";
import { analyzeWebsite } from "./analyze-website";
import { toUserFacingError, UserFacingAnalysisError } from "./analysis-errors";
import type { AnalysisTier } from "./google-ai-analysis";

export type AnalysisStatus = "scanning" | "analyzing" | "optimizing";

export type AnalyzeWebsiteCallbacks = {
  onStatusChange?: (status: AnalysisStatus) => void;
};

const FRIENDLY_UNAVAILABLE =
  "Kampanya analizi tamamlanamadı. Lütfen birkaç saniye sonra tekrar deneyin.";

const TIER_TIMEOUT_MS = 65_000;
const FETCH_TIMEOUT_MS = 60_000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new UserFacingAnalysisError(message));
    }, ms);

    promise
      .then((value) => {
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timer);
        reject(error);
      });
  });
}

async function parseJsonResponse(
  response: Response,
): Promise<WebsiteAnalysis | { message?: string }> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new UserFacingAnalysisError(FRIENDLY_UNAVAILABLE);
  }

  try {
    return (await response.json()) as WebsiteAnalysis | { message?: string };
  } catch {
    throw new UserFacingAnalysisError(FRIENDLY_UNAVAILABLE);
  }
}

async function analyzeViaApi(url: string, tier: AnalysisTier): Promise<WebsiteAnalysis> {
  const response = await fetch("/api/analyze-website", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ url, tier }),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  const payload = await parseJsonResponse(response);

  if (!response.ok) {
    const serverMessage = "message" in payload ? payload.message : undefined;
    throw toUserFacingError(new Error(serverMessage ?? FRIENDLY_UNAVAILABLE));
  }

  return payload as WebsiteAnalysis;
}

async function runTier(url: string, tier: AnalysisTier): Promise<WebsiteAnalysis> {
  const tierWork = (async () => {
    try {
      return await analyzeViaApi(url, tier);
    } catch (apiError) {
      try {
        return await analyzeWebsite({ data: { url, tier } });
      } catch (serverFnError) {
        throw toUserFacingError(serverFnError ?? apiError);
      }
    }
  })();

  return withTimeout(
    tierWork,
    TIER_TIMEOUT_MS,
    "Analiz beklenenden uzun sürdü. Lütfen tekrar deneyin.",
  );
}

function shouldFailover(error: unknown): boolean {
  if (error instanceof UserFacingAnalysisError && !error.canRetry) {
    return false;
  }

  const message = error instanceof Error ? error.message : String(error);
  return !message.includes("Web sitesine erişilemedi");
}

export async function analyzeWebsiteClient(
  url: string,
  callbacks?: AnalyzeWebsiteCallbacks,
): Promise<WebsiteAnalysis> {
  callbacks?.onStatusChange?.("scanning");

  try {
    callbacks?.onStatusChange?.("analyzing");
    return await runTier(url, "primary");
  } catch (primaryError) {
    if (!shouldFailover(primaryError)) {
      throw toUserFacingError(primaryError);
    }

    console.error("[analyze-client] primary tier failed, failing over:", primaryError);

    callbacks?.onStatusChange?.("optimizing");

    try {
      return await runTier(url, "fallback");
    } catch (fallbackError) {
      throw toUserFacingError(fallbackError);
    }
  }
}
