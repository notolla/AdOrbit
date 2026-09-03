/** LinkedIn Marketing API — OAuth scaffold (Live API modu). */
export function isLinkedInAdsConfigured(): boolean {
  const clientId =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_LINKEDIN_ADS_CLIENT_ID) ||
    process.env.VITE_LINKEDIN_ADS_CLIENT_ID ||
    process.env.LINKEDIN_ADS_CLIENT_ID;
  return Boolean(clientId);
}
