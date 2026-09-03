import { useGoogleAdsConnection } from "@/contexts/GoogleAdsConnectionContext";
import { GoogleAdsConnectCard } from "@/components/landing/GoogleAdsConnectCard";
import type { WebsiteAnalysis } from "@/services/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectorKeywordReport } from "@/components/landing/SectorKeywordReport";
import { ResponsiveAdCopy } from "@/components/landing/ResponsiveAdCopy";

type CampaignPreviewProps = {
  analysis: WebsiteAnalysis;
  websiteUrl: string;
  versionLabel?: string | null;
};

export function CampaignPreview({ analysis, websiteUrl, versionLabel }: CampaignPreviewProps) {
  const { isConnected } = useGoogleAdsConnection();
  const [openCampaign, ...lockedCampaigns] = analysis.campaigns;
  const totalNegativeKeywords = analysis.campaigns.reduce(
    (sum, campaign) => sum + campaign.negative_keywords.length,
    0,
  );

  if (!openCampaign) {
    return null;
  }

  return (
    <section id="onizleme" className="scroll-mt-20 border-b border-slate-200/60 bg-surface py-20">
      <div className="mx-auto max-w-5xl px-5">
        <header className="mb-8">
          <p className="section-label">Analiz sonuçları</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-slate-900">
              Kampanya, anahtar kelime ve reklam metni
            </h2>
            {versionLabel ? (
              <span className="pill-badge-google text-[11px]">{versionLabel}</span>
            ) : null}
            {isConnected ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#34A853]/30 bg-[#34A853]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#1e7e34]">
                Google Ads bağlı
              </span>
            ) : null}
          </div>
        </header>

        <div className="surface-card divide-y divide-slate-200/80">
          <div className="grid gap-6 p-6 sm:grid-cols-2">
            <div>
              <p className="section-label">Sektör</p>
              <p className="mt-1.5 text-sm font-medium text-slate-900">{analysis.sector}</p>
            </div>
            <div>
              <p className="section-label">Teşhis özeti</p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {analysis.diagnosis_summary}
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="campaigns" className="mt-6">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-xl border border-slate-200/80 bg-slate-50/80 p-1">
            <TabsTrigger
              value="campaigns"
              className="rounded-lg px-4 py-2 text-sm data-[state=active]:border data-[state=active]:border-slate-200/80 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Kampanya Grupları
            </TabsTrigger>
            <TabsTrigger
              value="keywords"
              className="rounded-lg px-4 py-2 text-sm data-[state=active]:border data-[state=active]:border-slate-200/80 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Anahtar Kelime Raporu
            </TabsTrigger>
            <TabsTrigger
              value="adcopy"
              className="rounded-lg px-4 py-2 text-sm data-[state=active]:border data-[state=active]:border-slate-200/80 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              RSA Reklam Metinleri
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="mt-4 space-y-3">
            <article className="surface-card overflow-hidden">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 px-6 py-4">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-slate-900">
                    {openCampaign.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">Reklam grubu · Yüksek niyet</p>
                </div>
                <span className="status-success">Açık</span>
              </div>
              <div className="px-6 py-4">
                <p className="section-label">Anahtar kelimeler</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {openCampaign.keywords.map((kw) => (
                    <li key={kw} className="pill-badge">
                      {kw}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-slate-500">
                  {openCampaign.rsa.headlines.length} RSA başlık ·{" "}
                  {openCampaign.negative_keywords.length} negatif kelime hazır
                </p>
              </div>
            </article>

            {lockedCampaigns.length > 0 && !isConnected ? (
              <div className="relative min-h-[280px]">
                <div className="space-y-3 pb-16">
                  {lockedCampaigns.map((campaign) => (
                    <article key={campaign.name} className="surface-card overflow-hidden">
                      <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 px-6 py-4">
                        <div>
                          <h3 className="text-sm font-semibold tracking-tight text-slate-900">
                            {campaign.name}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-500">Reklam grubu · Kilitli</p>
                        </div>
                        <span className="inline-flex items-center gap-1 pill-badge text-slate-500">
                          Kilitli
                        </span>
                      </div>
                      <div className="relative px-6 py-4">
                        <div className="pointer-events-none select-none blur-sm">
                          <ul className="flex flex-wrap gap-1.5">
                            {campaign.keywords.map((kw) => (
                              <li key={kw} className="pill-badge">
                                {kw}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 top-[20%] bg-gradient-to-b from-transparent via-white/55 to-white/92 backdrop-blur-[1px]"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 top-[35%] backdrop-blur-md"
                  aria-hidden
                />
                <div className="absolute inset-0 flex items-center justify-center px-4">
                  <GoogleAdsConnectCard />
                </div>
              </div>
            ) : null}

            {lockedCampaigns.length > 0 && isConnected
              ? lockedCampaigns.map((campaign) => (
                  <article key={campaign.name} className="surface-card overflow-hidden">
                    <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 px-6 py-4">
                      <div>
                        <h3 className="text-sm font-semibold tracking-tight text-slate-900">
                          {campaign.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">Reklam grubu</p>
                      </div>
                      <span className="status-success">Açık</span>
                    </div>
                    <div className="px-6 py-4">
                      <p className="section-label">Anahtar kelimeler</p>
                      <ul className="mt-3 flex flex-wrap gap-1.5">
                        {campaign.keywords.map((kw) => (
                          <li key={kw} className="pill-badge">
                            {kw}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-4 text-xs text-slate-500">
                        {campaign.negative_keywords.length} negatif kelime
                      </p>
                    </div>
                  </article>
                ))
              : null}

            <p className="text-center text-xs text-slate-500">
              {analysis.campaigns.length} kampanya · {totalNegativeKeywords} negatif kelime · CSV /
              Ads Editor uyumlu aktarım
            </p>
          </TabsContent>

          <TabsContent value="keywords" className="mt-4">
            <SectorKeywordReport analysis={analysis} />
          </TabsContent>

          <TabsContent value="adcopy" className="mt-4">
            <ResponsiveAdCopy
              campaigns={analysis.campaigns}
              analysis={analysis}
              websiteUrl={websiteUrl}
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
