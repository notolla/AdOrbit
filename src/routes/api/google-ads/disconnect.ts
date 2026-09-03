import { createFileRoute } from "@tanstack/react-router";
import { buildClearGoogleAdsSessionCookies, isSecureRequest } from "@/services/google-ads/cookies";

export const Route = createFileRoute("/api/google-ads/disconnect")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secure = isSecureRequest(request);
        const headers = new Headers({ "Content-Type": "application/json" });

        for (const cookie of buildClearGoogleAdsSessionCookies(secure)) {
          headers.append("Set-Cookie", cookie);
        }

        return new Response(JSON.stringify({ disconnected: true }), { status: 200, headers });
      },
    },
  },
});
