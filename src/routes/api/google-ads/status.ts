import { createFileRoute } from "@tanstack/react-router";
import { readGoogleAdsSession } from "@/services/google-ads/cookies";
import { isGoogleAdsOAuthConfigured } from "@/services/google-ads/config";

export const Route = createFileRoute("/api/google-ads/status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = readGoogleAdsSession(request);
        const connected = Boolean(session.refreshToken && session.customerId);

        return Response.json({
          connected,
          oauthConfigured: isGoogleAdsOAuthConfigured(),
          customerId: connected ? maskCustomerId(session.customerId!) : null,
        });
      },
    },
  },
});

function maskCustomerId(customerId: string): string {
  if (customerId.length <= 4) return customerId;
  return `***${customerId.slice(-4)}`;
}
