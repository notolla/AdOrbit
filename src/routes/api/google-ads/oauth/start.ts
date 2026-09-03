import { createFileRoute } from "@tanstack/react-router";
import { randomBytes } from "node:crypto";
import { buildOAuthStateCookie, isSecureRequest } from "@/services/google-ads/cookies";
import { isGoogleAdsOAuthConfigured } from "@/services/google-ads/config";
import { buildGoogleAdsAuthUrl, resolveOAuthRedirectUri } from "@/services/google-ads/oauth";

export const Route = createFileRoute("/api/google-ads/oauth/start")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!isGoogleAdsOAuthConfigured()) {
          return Response.redirect(new URL("/?google_ads_error=not_configured", request.url));
        }

        const secure = isSecureRequest(request);
        const state = randomBytes(24).toString("hex");
        const redirectUri = resolveOAuthRedirectUri(request);
        const authUrl = buildGoogleAdsAuthUrl(redirectUri, state);

        const headers = new Headers();
        headers.append("Set-Cookie", buildOAuthStateCookie(state, secure));
        headers.set("Location", authUrl);

        return new Response(null, { status: 302, headers });
      },
    },
  },
});
