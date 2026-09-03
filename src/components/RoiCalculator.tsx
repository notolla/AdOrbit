import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

const HOURS_SAVED_PER_CAMPAIGN = 2;
const WEEKS_PER_MONTH = 4.33;
const HOURLY_AGENCY_RATE = 750;

function formatHours(hours: number) {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Math.round(hours));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function RoiCalculator() {
  const [count, setCount] = useState(5);

  const metrics = useMemo(() => {
    const weeklyHoursSaved = count * HOURS_SAVED_PER_CAMPAIGN;
    const monthlyHoursSaved = weeklyHoursSaved * WEEKS_PER_MONTH;
    const monthlyCostSaved = monthlyHoursSaved * HOURLY_AGENCY_RATE;

    return {
      monthlyHoursSaved,
      monthlyCostSaved,
    };
  }, [count]);

  function scrollToForm() {
    document.getElementById("kampanya-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      document.getElementById("website")?.focus();
    }, 400);
  }

  const fillPercent = ((count - 1) / 19) * 100;

  return (
    <section className="border-b border-slate-200/60 bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-5">
        <header className="max-w-xl">
          <p className="section-label">ROI hesaplayıcı</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.75rem]">
            Zaman ve maliyet tasarrufunuzu hesaplayın
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Haftalık kampanya hacminize göre AdBuilder AI ile kazandığınız operasyonel verimliliği
            görün.
          </p>
        </header>

        <div className="surface-card mt-10 rounded-xl p-6 sm:p-7">
          <div>
            <div className="flex items-end justify-between gap-4">
              <label htmlFor="roi-slider" className="section-label">
                Haftalık kampanya / müşteri sayısı
              </label>
              <span className="font-mono text-2xl font-semibold tracking-tight text-[#4285F4]">
                {count}
              </span>
            </div>

            <div className="relative mt-6">
              <div
                className="pointer-events-none absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#4285F4]"
                style={{ width: `${fillPercent}%` }}
              />
              <input
                id="roi-slider"
                type="range"
                min={1}
                max={20}
                step={1}
                value={count}
                onChange={(event) => setCount(Number(event.target.value))}
                className="roi-range relative z-10 w-full"
                aria-valuemin={1}
                aria-valuemax={20}
                aria-valuenow={count}
              />
            </div>

            <div className="mt-2 flex justify-between text-[11px] text-slate-400">
              <span>1</span>
              <span>20</span>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-5">
              <p className="section-label">Zaman tasarrufu</p>
              <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#34A853]">
                {formatHours(metrics.monthlyHoursSaved)} saat
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Aylık toplam · kampanya başına ~{HOURS_SAVED_PER_CAMPAIGN} saat manuel iş tasarrufu
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-5">
              <p className="section-label">Operasyonel verimlilik</p>
              <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#4285F4]">
                {formatCurrency(metrics.monthlyCostSaved)}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Tahmini aylık operasyonel kazanç · saatlik {formatCurrency(HOURLY_AGENCY_RATE)} baz
                alınarak
              </p>
            </div>
          </div>

          <p className="mt-5 text-xs text-slate-500">
            Hesaplama varsayımı: kampanya başına ortalama {HOURS_SAVED_PER_CAMPAIGN} saat manuel
            kurulum yerine AdBuilder AI ile ~60 saniyelik otomasyon.
          </p>

          <button type="button" onClick={scrollToForm} className="btn-primary mt-6 w-full sm:w-auto">
            Hemen Kampanya Oluştur
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
