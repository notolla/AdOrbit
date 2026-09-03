import { Check, X } from "lucide-react";

type ComparisonRow = {
  feature: string;
  traditional: string;
  adbuilder: string;
  traditionalPositive?: boolean;
  adbuilderPositive: boolean;
};

const ROWS: ComparisonRow[] = [
  {
    feature: "Kampanya Kurulum Süresi",
    traditional: "2 – 4 Saat",
    adbuilder: "60 Saniye",
    adbuilderPositive: true,
  },
  {
    feature: "Maliyet / Bütçe",
    traditional: "Yüksek Ajans / Personel Ücretleri",
    adbuilder: "Minimum Maliyetle Otomasyon",
    adbuilderPositive: true,
  },
  {
    feature: "Negatif Kelime Havuzu",
    traditional: "Manuel ve Eksik Kalabilir",
    adbuilder: "Otomatik Bütçe Koruma & Filtreleme",
    adbuilderPositive: true,
  },
  {
    feature: "Ticari Niyet Analizi",
    traditional: "Uzman İnisiyatifi & Tahmini",
    adbuilder: "Yapay Zeka Destekli Long-Tail Veri Analizi",
    adbuilderPositive: true,
  },
  {
    feature: "Dışa Aktarım",
    traditional: "Excel'de Manuel Düzenleme",
    adbuilder: "Anında CSV / Ads Editor Uyumlu Aktarım",
    adbuilderPositive: true,
  },
];

function StatusIcon({ positive }: { positive: boolean }) {
  if (positive) {
    return <Check className="h-4 w-4 shrink-0 text-slate-700" strokeWidth={2} />;
  }
  return <X className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />;
}

export function ComparisonTable() {
  return (
    <section className="border-b border-slate-200/60 bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-5">
        <header className="max-w-xl">
          <p className="section-label">Karşılaştırma</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.75rem]">
            Geleneksel ajans süreçleri vs. AdBuilder AI
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Manuel süreçlerle karşılaştırıldığında zaman, maliyet ve kalite farkı.
          </p>
        </header>

        <div className="mt-12 hidden overflow-hidden rounded-xl border border-slate-200/80 bg-card shadow-sm sm:block">
          <div className="grid grid-cols-[1.2fr_1fr_1fr] border-b border-slate-200/80 bg-slate-50/80 text-sm">
            <div className="px-5 py-3.5 font-medium text-slate-500">Özellik</div>
            <div className="border-l border-slate-200/80 px-5 py-3.5 font-medium text-slate-500">
              Geleneksel ajans
            </div>
            <div className="border-l border-[#4285F4]/15 bg-[#4285F4]/[0.03] px-5 py-3.5">
              <span className="inline-flex items-center gap-2 font-medium text-slate-900">
                AdBuilder AI
                <span className="pill-badge-google">Önerilen</span>
              </span>
            </div>
          </div>

          {ROWS.map((row, index) => (
            <div
              key={row.feature}
              className={`grid grid-cols-[1.2fr_1fr_1fr] text-sm ${
                index < ROWS.length - 1 ? "border-b border-slate-200/80" : ""
              }`}
            >
              <div className="px-5 py-4 font-medium text-slate-900">{row.feature}</div>
              <div className="flex items-center gap-2.5 border-l border-slate-200/80 px-5 py-4 text-slate-600">
                <StatusIcon positive={row.traditionalPositive ?? false} />
                {row.traditional}
              </div>
              <div className="flex items-center gap-2.5 border-l border-[#4285F4]/15 bg-[#4285F4]/[0.03] px-5 py-4 font-medium text-slate-900">
                <StatusIcon positive={row.adbuilderPositive} />
                {row.adbuilder}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-3 sm:hidden">
          {ROWS.map((row) => (
            <article key={row.feature} className="surface-card overflow-hidden">
              <div className="border-b border-slate-200/80 bg-slate-50/80 px-4 py-3">
                <h3 className="text-sm font-medium text-slate-900">{row.feature}</h3>
              </div>
              <div className="space-y-3 px-4 py-4">
                <div className="flex items-start gap-2.5">
                  <StatusIcon positive={false} />
                  <div>
                    <p className="section-label">Geleneksel</p>
                    <p className="mt-0.5 text-sm text-slate-600">{row.traditional}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-[#4285F4]/15 bg-[#4285F4]/[0.03] p-3">
                  <div className="flex items-start gap-2.5">
                    <StatusIcon positive />
                    <div>
                      <p className="inline-flex items-center gap-2 section-label">
                        AdBuilder AI
                        <span className="pill-badge">Önerilen</span>
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-slate-900">{row.adbuilder}</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
