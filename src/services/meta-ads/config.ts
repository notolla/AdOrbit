/** Meta Marketing API — OAuth scaffold (Live API modu). */
export function isMetaAdsConfigured(): boolean {
  const appId =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_META_ADS_APP_ID) ||
    process.env.VITE_META_ADS_APP_ID ||
    process.env.META_ADS_APP_ID;
  return Boolean(appId);
}
