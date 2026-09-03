const TEST_ACCOUNT_ONLY_PATTERN =
  /developer token is only approved for use with test accounts/i;

const API_NOT_ENABLED_PATTERN = /has not been used.*disabled/is;

export function formatGoogleAdsApiError(status: number, errorText: string): Error {
  const lower = errorText.toLowerCase();

  if (TEST_ACCOUNT_ONLY_PATTERN.test(errorText)) {
    return new Error(
      "Developer Token yalnızca test hesapları için onaylı. Gerçek Google Ads hesabınızda kullanmak için Google'dan Basic veya Standard Access başvurusu yapın: https://ads.google.com/aw/apicenter",
    );
  }

  if (status === 403 && API_NOT_ENABLED_PATTERN.test(errorText)) {
    return new Error(
      "Google Ads API, Google Cloud projenizde etkin değil. console.cloud.google.com → Google Ads API → Enable.",
    );
  }

  try {
    const payload = JSON.parse(errorText) as {
      error?: {
        message?: string;
        details?: Array<{
          errors?: Array<{ message?: string; errorCode?: Record<string, string> }>;
        }>;
      };
    };

    const detailMessages =
      payload.error?.details?.flatMap((detail) =>
        (detail.errors ?? []).map((item) => item.message).filter(Boolean),
      ) ?? [];

    const nestedMessage = detailMessages[0] ?? payload.error?.message;
    if (nestedMessage && TEST_ACCOUNT_ONLY_PATTERN.test(nestedMessage)) {
      return new Error(
        "Developer Token yalnızca test hesapları için onaylı. Gerçek Google Ads hesabınızda kullanmak için Google'dan Basic veya Standard Access başvurusu yapın: https://ads.google.com/aw/apicenter",
      );
    }

    const message = nestedMessage ?? `Google Ads API hatası (${status})`;
    const error = new Error(message.slice(0, 300)) as Error & { status?: number };
    error.status = status;
    return error;
  } catch {
    return new Error(`Google Ads API hatası (${status}): ${errorText.slice(0, 240)}`);
  }
}
