import { Check } from "lucide-react";
import type { AnalysisStatus } from "@/services/analyze-client";

type StepState = "pending" | "active" | "completed";

type LiveActivityStepsProps = {
  status: AnalysisStatus;
  elapsedSeconds: number;
};

const STEPS: Array<{
  id: string;
  label: string;
  optimizingLabel?: string;
}> = [
  {
    id: "scan",
    label: "Web sitesi taranıyor ve içerik haritası çıkarılıyor...",
  },
  {
    id: "keywords",
    label: "Gemini AI ile sektörel anahtar kelimeler ve niyet analizi yapılıyor...",
    optimizingLabel: "Yedek analiz motoru devreye alınıyor...",
  },
  {
    id: "negatives",
    label: "Bütçe korumalı negatif kelime havuzu oluşturuluyor...",
  },
  {
    id: "package",
    label: "Google Ads kampanya yapısı paketleniyor...",
  },
];

function getActiveStepIndex(status: AnalysisStatus, elapsedSeconds: number): number {
  if (status === "scanning") {
    return elapsedSeconds >= 2 ? 1 : 0;
  }

  if (status === "optimizing") {
    return 1;
  }

  if (elapsedSeconds >= 12) return 3;
  if (elapsedSeconds >= 6) return 2;
  return 1;
}

function getStepState(stepIndex: number, activeIndex: number): StepState {
  if (stepIndex < activeIndex) return "completed";
  if (stepIndex === activeIndex) return "active";
  return "pending";
}

function StepIcon({ state }: { state: StepState }) {
  if (state === "completed") {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#34A853]/10">
        <Check className="h-3.5 w-3.5 text-[#34A853]" strokeWidth={2.5} />
      </span>
    );
  }

  if (state === "active") {
    return (
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <span className="absolute inline-flex h-5 w-5 animate-spin rounded-full border-2 border-[#4285F4]/25 border-t-[#4285F4]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#4285F4]" />
      </span>
    );
  }

  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center">
      <span className="h-2 w-2 rounded-full border border-slate-300 bg-slate-100" />
    </span>
  );
}

export function LiveActivitySteps({ status, elapsedSeconds }: LiveActivityStepsProps) {
  const activeIndex = getActiveStepIndex(status, elapsedSeconds);

  return (
    <div className="w-full max-w-md rounded-xl border border-slate-200/70 bg-white/55 px-5 py-5 shadow-sm backdrop-blur-md">
      <p className="section-label mb-4">Canlı analiz akışı</p>

      <ol className="space-y-3.5">
        {STEPS.map((step, index) => {
          const state = getStepState(index, activeIndex);
          const label =
            step.id === "keywords" && status === "optimizing" && step.optimizingLabel
              ? step.optimizingLabel
              : step.label;

          return (
            <li
              key={step.id}
              className={`flex items-start gap-3 transition-all duration-500 ${
                state === "active"
                  ? "opacity-100"
                  : state === "completed"
                    ? "opacity-80"
                    : "opacity-45"
              }`}
            >
              <StepIcon state={state} />
              <p
                className={`text-sm leading-snug ${
                  state === "active"
                    ? "animate-pulse font-medium text-slate-900"
                    : state === "completed"
                      ? "text-slate-600"
                      : "text-slate-400"
                }`}
              >
                {label}
              </p>
            </li>
          );
        })}
      </ol>

      <p className="mt-4 text-center text-[11px] text-slate-400">
        {elapsedSeconds >= 20
          ? "Yoğunluk nedeniyle biraz uzun sürebilir…"
          : `${elapsedSeconds} sn geçti · genellikle 15–30 sn sürer`}
      </p>
    </div>
  );
}
