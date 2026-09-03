import { useGoogleAdsConnection } from "@/contexts/GoogleAdsConnectionContext";
import { getPlatformRegistry } from "@/lib/platforms";

export function PlatformConnectionsPanel() {
  const { isConnected, status, connect } = useGoogleAdsConnection();
  const platforms = getPlatformRegistry({
    googleConnected: isConnected,
    googleOAuthConfigured: status.oauthConfigured,
  });

  return (
    <section className="border-b border-slate-200/60 bg-surface py-8">
      <div className="mx-auto max-w-6xl px-5">
        <p className="section-label">Platform bağlantıları</p>
        <h2 className="mt-2 font-display text-lg font-semibold text-slate-900">
          Canlı API entegrasyonları
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {platforms.map((platform) => (
            <article key={platform.id} className="surface-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{platform.label}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{platform.apiVersion}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    platform.connected
                      ? "bg-[#34A853]/10 text-[#1e7e34]"
                      : platform.oauthConfigured
                        ? "bg-slate-100 text-slate-600"
                        : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {platform.connected ? "Bağlı" : platform.oauthConfigured ? "Hazır" : "Yapılandır"}
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-600">
                Push: {platform.pushSupported ? "Aktif" : "Yakında"} · Metrik:{" "}
                {platform.metricsSupported ? "Aktif" : "Yakında"}
              </p>
              {platform.statusNote ? (
                <p className="mt-2 text-[11px] text-slate-400">{platform.statusNote}</p>
              ) : null}
              {platform.id === "google_ads" && !platform.connected && platform.oauthConfigured ? (
                <button type="button" onClick={connect} className="btn-secondary mt-3 w-full text-xs">
                  Google Ads Hesabını Bağla
                </button>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
