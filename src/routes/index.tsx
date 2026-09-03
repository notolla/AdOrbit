import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { SocialProof } from "@/components/landing/SocialProof";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CampaignPreview } from "@/components/landing/CampaignPreview";
import { AnalysisHistoryPanel } from "@/components/landing/AnalysisHistoryPanel";
import { ComparisonTable } from "@/components/ComparisonTable";
import { RoiCalculator } from "@/components/RoiCalculator";
import { FAQ } from "@/components/landing/FAQ";
import { loadAnalysisHistory } from "@/lib/analysis-history";
import { enrichKeywordsWithGoogleAds } from "@/lib/google-ads-connection";
import { useGoogleAdsConnection } from "@/contexts/GoogleAdsConnectionContext";
import type { AnalysisSnapshot, AnalysisSubmitPayload, WebsiteAnalysis } from "@/services/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AdBuilder AI | Google Ads Kampanyalarını 60 Saniyede Kur" },
      {
        name: "description",
        content:
          "Web sitenizi girin; yapay zeka sektörünüze özel reklam gruplarını, anahtar kelimeleri ve negatif kelimeleri 60 saniyede oluştursun.",
      },
      { property: "og:title", content: "AdBuilder AI | Yapay Zeka ile Google Ads Kurulumu" },
      {
        property: "og:description",
        content:
          "Niyet odaklı anahtar kelimeler, hazır reklam grupları ve bütçe koruyan negatif kelime listeleri.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [analysis, setAnalysis] = useState<WebsiteAnalysis | null>(null);
  const [activeSnapshot, setActiveSnapshot] = useState<AnalysisSnapshot | null>(null);
  const [history, setHistory] = useState<AnalysisSnapshot[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const previewRef = useRef<HTMLDivElement>(null);
  const { isConnected } = useGoogleAdsConnection();
  const wasConnectedRef = useRef(false);

  useEffect(() => {
    setHistory(loadAnalysisHistory());
  }, []);

  const scrollToPreview = useCallback(() => {
    previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    if (!analysis) return;
    scrollToPreview();
  }, [analysis, scrollToPreview]);

  useEffect(() => {
    if (!isConnected) {
      wasConnectedRef.current = false;
      return;
    }

    if (!analysis || wasConnectedRef.current) return;

    void enrichKeywordsWithGoogleAds(analysis)
      .then(({ keyword_report, hasLiveData }) => {
        setAnalysis((current) =>
          current ? { ...current, keyword_report } : current,
        );
        if (hasLiveData) {
          toast.success("Keyword Planner verileri tabloya yüklendi.");
        }
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "Veriler güncellenemedi.";
        toast.error(message);
      })
      .finally(() => {
        wasConnectedRef.current = true;
      });
  }, [isConnected, analysis]);

  function handleSubmitted(payload: AnalysisSubmitPayload) {
    setAnalysis(payload.analysis);
    setActiveSnapshot(payload.snapshot);
    setUserEmail(payload.email);
    setHistory(loadAnalysisHistory(payload.email));
  }

  function handleRestoreSnapshot(snapshot: AnalysisSnapshot) {
    setAnalysis(snapshot.analysis);
    setActiveSnapshot(snapshot);
    setUserEmail(snapshot.email);
    toast.success(`"${snapshot.label}" revizyonu yüklendi.`);
    scrollToPreview();
  }

  return (
    <main className="min-h-fit bg-background font-sans">
      <Navbar />
      <Hero onSubmitted={handleSubmitted} />
      <SocialProof />

      {history.length > 0 && !analysis ? (
        <AnalysisHistoryPanel
          history={userEmail ? loadAnalysisHistory(userEmail) : history}
          activeSnapshotId={activeSnapshot?.id}
          onRestore={handleRestoreSnapshot}
        />
      ) : null}

      <div ref={previewRef}>
        {analysis ? (
          <>
            <CampaignPreview
              analysis={analysis}
              websiteUrl={activeSnapshot?.website_url ?? ""}
              versionLabel={activeSnapshot?.label ?? null}
            />
            <AnalysisHistoryPanel
              compact
              history={userEmail ? loadAnalysisHistory(userEmail) : history}
              activeSnapshotId={activeSnapshot?.id}
              onRestore={handleRestoreSnapshot}
            />
          </>
        ) : null}
      </div>

      <HowItWorks />
      <ComparisonTable />
      <RoiCalculator />
      <FAQ />

      <footer className="border-t border-slate-200/60 bg-surface py-10">
        <div className="mx-auto max-w-6xl px-5 text-sm text-slate-500">
          AdBuilder AI — Google Ads kampanya otomasyon platformu
        </div>
      </footer>
    </main>
  );
}
