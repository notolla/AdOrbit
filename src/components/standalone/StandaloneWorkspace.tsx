import { useRef, useState } from "react";
import { toast } from "sonner";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { SocialProof } from "@/components/landing/SocialProof";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FAQ } from "@/components/landing/FAQ";
import { ComparisonTable } from "@/components/ComparisonTable";
import { RoiCalculator } from "@/components/RoiCalculator";
import { StrategyReportPreview } from "@/components/standalone/StrategyReportPreview";
import { generateStrategyClient } from "@/services/strategy-client";
import type { StrategyReport } from "@/services/strategy-types";
import type { OnboardingFormData } from "@/lib/onboarding-types";
import {
  isStrategyReportUnlocked,
  unlockStrategyReport,
} from "@/lib/strategy-report-access";

export function StandaloneWorkspace() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<StrategyReport | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(form: OnboardingFormData) {
    setLoading(true);
    try {
      const next = await generateStrategyClient({
        product_service: form.product_service,
        website_url: form.website_url || undefined,
        channels: form.channels,
        audience_profile: form.audience_profile,
        geo_scope: form.geo_scope,
        campaign_goal: form.campaign_goal,
        budget_range: form.budget_range,
        communication_tone: form.communication_tone,
      });
      setReport(next);
      setUnlocked(isStrategyReportUnlocked(next.generated_at));

      toast.success("Strateji raporu hazır — tam içerik için e-posta doğrulaması gerekir.");
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
      <OnboardingWizard loading={loading} onSubmit={handleSubmit} />

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
