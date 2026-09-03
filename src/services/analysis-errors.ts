export class UserFacingAnalysisError extends Error {
  readonly canRetry: boolean;

  constructor(message: string, canRetry = true) {
    super(message);
    this.name = "UserFacingAnalysisError";
    this.canRetry = canRetry;
  }
}

export function toUserFacingError(error: unknown): UserFacingAnalysisError {
  if (error instanceof UserFacingAnalysisError) {
    return error;
  }

  const raw = error instanceof Error ? error.message : String(error);

  if (raw.includes("API key") || raw.includes("API anahtarı")) {
    return new UserFacingAnalysisError(
      "Yapay zeka servisi yapılandırması eksik. Lütfen daha sonra tekrar deneyin.",
      false,
    );
  }

  if (raw.includes("429") || raw.toLowerCase().includes("quota") || raw.includes("RESOURCE_EXHAUSTED")) {
    return new UserFacingAnalysisError(
      "Analiz servisi şu an yoğun. Lütfen birkaç dakika sonra tekrar deneyin.",
    );
  }

  if (raw.includes("503") || raw.includes("504") || raw.toLowerCase().includes("timeout")) {
    return new UserFacingAnalysisError(
      "Analiz servisi geçici olarak yanıt vermiyor. Lütfen tekrar deneyin.",
    );
  }

  if (raw.includes("Siteye erişilemedi") || raw.includes("HTTP")) {
    return new UserFacingAnalysisError(
      "Web sitesine erişilemedi. Adresi kontrol edip tekrar deneyin.",
    );
  }

  return new UserFacingAnalysisError(
    "Kampanya analizi tamamlanamadı. Lütfen birkaç saniye sonra tekrar deneyin.",
  );
}
