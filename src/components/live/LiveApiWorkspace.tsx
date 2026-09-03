import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Hero } from "@/components/landing/Hero";
import { SocialProof } from "@/components/landing/SocialProof";
import { CampaignPreview } from "@/components/landing/CampaignPreview";
import { AnalysisHistoryPanel } from "@/components/landing/AnalysisHistoryPanel";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ComparisonTable } from "@/components/ComparisonTable";
import { RoiCalculator } from "@/components/RoiCalculator";
import { FAQ } from "@/components/landing/FAQ";
import { PlatformConnectionsPanel } from "@/components/live/PlatformConnectionsPanel";
import { loadAnalysisHistory } from "@/lib/analysis-history";
import { clearAppHistory } from "@/lib/clear-app-history";
import { loadAnalysisSession, saveAnalysisSession } from "@/lib/analysis-session";
import { enrichKeywordsWithGoogleAds } from "@/lib/google-ads-connection";
import { useGoogleAdsConnection } from "@/contexts/GoogleAdsConnectionContext";
import type { AnalysisSnapshot, AnalysisSubmitPayload, WebsiteAnalysis } from "@/services/types";

export function LiveApiWorkspace() {
  const [analysis, setAnalysis] = useState<WebsiteAnalysis | null>(null);
  const [activeSnapshot, setActiveSnapshot] = useState<AnalysisSnapshot | null>(null);
  const [history, setHistory] = useState<AnalysisSnapshot[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const previewRef = useRef<HTMLDivElement>(null);
  const { isConnected, isLoading: isConnectionLoading } = useGoogleAdsConnection();
  const wasConnectedRef = useRef(false);
  const restoredAfterConnectRef = useRef(false);

  const scrollToPreview = useCallback(() => {
    previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    setHistory(loadAnalysisHistory());
    const session = loadAnalysisSession();
    if (session?.analysis) {
      setAnalysis(session.analysis);
      setActiveSnapshot(session.snapshot);
      setUserEmail(session.email);
    }
  }, []);

  useEffect(() => {
    if (!analysis) return;
    saveAnalysisSession({
      analysis,
      snapshot: activeSnapshot,
      websiteUrl: activeSnapshot?.website_url ?? "",
      email: userEmail,
    });
  }, [analysis, activeSnapshot, userEmail]);

  useEffect(() => {
    if (isConnectionLoading || !isConnected || restoredAfterConnectRef.current) return;
    if (analysis) {
      restoredAfterConnectRef.current = true;
      return;
    }

    const session = loadAnalysisSession();
    const snapshot = session?.snapshot ?? loadAnalysisHistory()[0] ?? null;

    if (snapshot) {
      setAnalysis(snapshot.analysis);
      setActiveSnapshot(snapshot);
      setUserEmail(snapshot.email);
      restoredAfterConnectRef.current = true;
      window.requestAnimationFrame(() => scrollToPreview());
      return;
    }

    if (session?.analysis) {
      setAnalysis(session.analysis);
      setActiveSnapshot(session.snapshot);
      setUserEmail(session.email);
      restoredAfterConnectRef.current = true;
      window.requestAnimationFrame(() => scrollToPreview());
      return;
    }

    restoredAfterConnectRef.current = true;
    toast.message("Google Ads bağlandı. Canlı verileri görmek için önce bir site analizi yapın.");
  }, [isConnected, isConnectionLoading, analysis, scrollToPreview]);

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
        setAnalysis((current) => (current ? { ...current, keyword_report } : current));
        if (hasLiveData) {
          toast.success("Keyword Planner verileri tabloya yüklendi.");
        } else {
          toast.message("Hesap bağlı. Keyword Planner verisi henüz gelmedi; tahmini veriler gösteriliyor.");
        }
      })
      .catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : "Veriler güncellenemedi.");
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

  function handleClearHistory() {
    clearAppHistory();
    setHistory([]);
    setAnalysis(null);
    setActiveSnapshot(null);
    setUserEmail("");
    restoredAfterConnectRef.current = false;
    wasConnectedRef.current = false;
    toast.success("Geçmiş temizlendi.");
  }

  return (
    <>
      <PlatformConnectionsPanel />
      <Hero onSubmitted={handleSubmitted} />
      <SocialProof />

      {history.length > 0 && !analysis ? (
        <AnalysisHistoryPanel
          history={userEmail ? loadAnalysisHistory(userEmail) : history}
          activeSnapshotId={activeSnapshot?.id}
          onRestore={handleRestoreSnapshot}
          onClear={handleClearHistory}
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
              onClear={handleClearHistory}
            />
          </>
        ) : null}
      </div>

      <HowItWorks />
      <ComparisonTable />
      <RoiCalculator />
      <FAQ />
    </>
  );
}
