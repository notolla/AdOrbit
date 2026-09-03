import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  analyzeWebsiteClient,
  type AnalysisStatus,
} from "@/services/analyze-client";
import type { AnalysisSubmitPayload } from "@/services/types";
import { saveAnalysisSnapshot } from "@/lib/analysis-history";
import { LiveActivitySteps } from "@/components/landing/LiveActivitySteps";
import { OrbitalHeroAnimation } from "@/components/OrbitalHeroAnimation";

const BADGES = ["Google Ads API", "Gemini AI", "KVKK Uyumlu"];

type HeroProps = {
  onSubmitted: (payload: AnalysisSubmitPayload) => void;
};

export function Hero({ onSubmitted }: HeroProps) {
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("scanning");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!loading) {
      setElapsedSeconds(0);
      return;
    }

    const tick = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(tick);
  }, [loading]);

  useEffect(() => {
    if (!loading || analysisStatus !== "scanning") return;

    const timer = window.setTimeout(() => {
      setAnalysisStatus((current) => (current === "scanning" ? "analyzing" : current));
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [loading, analysisStatus]);

  useEffect(() => {
    if (!loading || analysisStatus !== "analyzing") return;

    const timer = window.setTimeout(() => {
      setAnalysisStatus((current) => (current === "analyzing" ? "optimizing" : current));
    }, 18_000);

    return () => window.clearTimeout(timer);
  }, [loading, analysisStatus]);

  async function runAnalysis() {
    setLoading(true);
    setErrorMessage(null);
    setAnalysisStatus("scanning");

    try {
      const analysis = await analyzeWebsiteClient(website.trim(), {
        onStatusChange: setAnalysisStatus,
      });

      const snapshot = saveAnalysisSnapshot({
        email: email.trim(),
        website_url: website.trim(),
        analysis,
      });

      const { error } = await supabase
        .from("leads")
        .insert({ website_url: website.trim(), email: email.trim() });

      if (error) {
        toast.error("Kayıt sırasında bir sorun oluştu. Önizleme yine de gösteriliyor.");
      } else {
        toast.success("Kampanya önizlemeniz hazırlandı.");
      }

      onSubmitted({ analysis, website: website.trim(), email: email.trim(), snapshot });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Kampanya analizi tamamlanamadı. Lütfen tekrar deneyin.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!website.trim() || !email.trim()) {
      toast.error("Lütfen web sitesi adresinizi ve e-posta adresinizi girin.");
      return;
    }

    await runAnalysis();
  }

  return (
    <section id="kampanya-form" className="min-h-fit border-b border-slate-200/60 bg-background">
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-16 sm:pt-24">
        <div className="max-w-2xl">
          <span className="pill-badge-google">
            <span className="google-dots scale-90">
              <span />
              <span />
              <span />
              <span />
            </span>
            Google Ads otomasyon platformu
          </span>
          <h1 className="mt-6 font-display text-[2rem] font-semibold leading-[1.15] tracking-tight text-slate-900 sm:text-[2.75rem] lg:text-5xl">
            Google Ads kampanyalarınızı{" "}
            <span className="text-[#4285F4]">60 saniyede</span> kurun
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600">
            Web sitenizi analiz edin; sektörünüze özel reklam grupları, long-tail anahtar
            kelimeler ve bütçe koruma listeleri otomatik oluşturulsun.
          </p>
        </div>

        <div className="mt-14 grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <form onSubmit={handleSubmit} className="surface-card relative p-6 sm:p-7">
              {loading ? (
                <div
                  className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70 px-6 backdrop-blur-sm"
                  aria-live="polite"
                  aria-busy="true"
                >
                  <LiveActivitySteps status={analysisStatus} elapsedSeconds={elapsedSeconds} />
                </div>
              ) : null}

              <div className="space-y-5">
                <div>
                  <label htmlFor="website" className="section-label">
                    Web sitesi
                  </label>
                  <input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="websiteadresiniz.com"
                    className="input-field mt-2"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="section-label">
                    E-posta
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ad@sirketiniz.com"
                    className="input-field mt-2"
                    disabled={loading}
                  />
                </div>
              </div>

              {errorMessage ? (
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-sm text-slate-700">{errorMessage}</p>
                  <button
                    type="button"
                    onClick={() => void runAnalysis()}
                    className="btn-secondary mt-3"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Tekrar Dene
                  </button>
                </div>
              ) : null}

              <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                Kampanyanı Oluştur
              </button>

              <ul className="mt-5 flex flex-wrap gap-2">
                {BADGES.map((badge) => (
                  <li key={badge} className="pill-badge">
                    {badge}
                  </li>
                ))}
              </ul>
            </form>
          </div>

          <div className="order-first flex items-center justify-center lg:order-last">
            <OrbitalHeroAnimation />
          </div>
        </div>
      </div>
    </section>
  );
}
