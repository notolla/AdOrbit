import { useRef, useState } from "react";
import { toast } from "sonner";
import { SocialProof } from "@/components/landing/SocialProof";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FAQ } from "@/components/landing/FAQ";
import { ComparisonTable } from "@/components/ComparisonTable";
import { RoiCalculator } from "@/components/RoiCalculator";
import { StrategyInputForm } from "@/components/standalone/StrategyInputForm";
import { StrategyReportPreview } from "@/components/standalone/StrategyReportPreview";
import { generateStrategyClient } from "@/services/strategy-client";
import type { StrategyReport } from "@/services/strategy-types";
import {
  isStrategyReportUnlocked,
  unlockStrategyReport,
} from "@/lib/strategy-report-access";

export function StandaloneWorkspace() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<StrategyReport | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(input: {
    website_url: string;
    product_service: string;
    industry_notes: string;
  }) {
    setLoading(true);
    try {
      const next = await generateStrategyClient({
        product_service: input.product_service,
        website_url: input.website_url || undefined,
        industry_notes: input.industry_notes || undefined,
      });
      setReport(next);
      setUnlocked(isStrategyReportUnlocked(next.generated_at));

      toast.success("Strateji raporu özeti hazır — tam rapor için e-posta girin.");
      window.requestAnimationFrame(() => {
        reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Strateji oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  }

  function handleUnlock(email: string) {
    if (!report) return;
    unlockStrategyReport(report.generated_at, email);
    setUnlocked(true);
  }

  return (
    <>
      <StrategyInputForm loading={loading} onSubmit={handleSubmit} />

      <div ref={reportRef}>
        {report ? (
          <StrategyReportPreview report={report} unlocked={unlocked} onUnlock={handleUnlock} />
        ) : null}
      </div>

      <SocialProof />

      <HowItWorks />
      <ComparisonTable />
      <RoiCalculator />
      <FAQ />
    </>
  );
}
