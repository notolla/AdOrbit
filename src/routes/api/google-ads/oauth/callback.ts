import { createFileRoute } from "@tanstack/react-router";
import {
  buildClearOAuthStateCookie,
  buildGoogleAdsSessionCookies,
  getCookie,
  isSecureRequest,
} from "@/services/google-ads/cookies";
import {
  exchangeAuthorizationCode,
  listAccessibleCustomerIds,
  resolveEnvCustomerId,
  resolveOAuthRedirectUri,
} from "@/services/google-ads/oauth";

function encodeOAuthError(error: unknown): string {
  if (!(error instanceof Error)) return "exchange_failed";

  const message = error.message.toLowerCase();
  if (message.includes("yenileme jetonu")) return "missing_refresh_token";
  if (message.includes("erişilebilir google ads hesapları")) return "list_accounts_failed";
  if (message.includes("oauth token değişimi")) return "token_exchange_failed";
  return "exchange_failed";
}

function encodeOAuthErrorDetail(error: unknown): string {
  if (!(error instanceof Error)) return "";
  return encodeURIComponent(error.message.slice(0, 180));
}

export const Route = createFileRoute("/api/google-ads/oauth/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const oauthError = url.searchParams.get("error");
        const secure = isSecureRequest(request);
        const origin = url.origin;

        const headers = new Headers();
        headers.append("Set-Cookie", buildClearOAuthStateCookie(secure));

        if (oauthError) {
          headers.set("Location", `${origin}/?google_ads_error=${encodeURIComponent(oauthError)}`);
          return new Response(null, { status: 302, headers });
        }

        if (!code || !state) {
          headers.set("Location", `${origin}/?google_ads_error=missing_code`);
          return new Response(null, { status: 302, headers });
        }

        const savedState = getCookie(request, "google_ads_oauth_state");
        if (!savedState || savedState !== state) {
          headers.set("Location", `${origin}/?google_ads_error=invalid_state`);
          return new Response(null, { status: 302, headers });
        }

        try {
          const redirectUri = resolveOAuthRedirectUri(request);
          const tokens = await exchangeAuthorizationCode(code, redirectUri);

          let customerIds: string[] = [];
          try {
            customerIds = await listAccessibleCustomerIds(tokens.accessToken);
          } catch (listError) {
            const envCustomerId = resolveEnvCustomerId();
            if (envCustomerId) {
              console.warn(
                "[google-ads/oauth/callback] listAccessibleCustomers failed — using GOOGLE_ADS_CUSTOMER_ID fallback",
                listError,
              );
              customerIds = [envCustomerId];
            } else {
              throw listError;
            }
          }

          if (customerIds.length === 0) {
            headers.set("Location", `${origin}/?google_ads_error=no_accounts`);
            return new Response(null, { status: 302, headers });
          }

          for (const cookie of buildGoogleAdsSessionCookies(tokens.refreshToken, customerIds[0]!, secure)) {
            headers.append("Set-Cookie", cookie);
          }

          headers.set("Location", `${origin}/?google_ads_connected=1`);
          return new Response(null, { status: 302, headers });
        } catch (error) {
          console.error("[google-ads/oauth/callback]", error);
          const code = encodeOAuthError(error);
          const detail = encodeOAuthErrorDetail(error);
          headers.set(
            "Location",
            `${origin}/?google_ads_error=${code}${detail ? `&google_ads_error_detail=${detail}` : ""}`,
          );
          return new Response(null, { status: 302, headers });
        }
      },
    },
  },
});
