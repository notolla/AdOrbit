import { ChevronDown, Lock, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

const OPEN_CAMPAIGN = {
  name: "Kampanya 1 — İmplant Tedavisi",
  group: "Reklam Grubu: İmplant / Yüksek Niyet",
  keywords: ["implant fiyatları", "zirkonyum kaplama", "diş implantı randevu"],
};

const LOCKED_CAMPAIGNS = [
  {
    name: "Kampanya 2 — Estetik Diş Hekimliği",
    group: "Reklam Grubu: Gülüş Tasarımı",
    keywords: ["gülüş tasarımı fiyat", "lamina veneer", "diş beyazlatma klinik"],
  },
  {
    name: "Kampanya 3 — Ortodonti ve Şeffaf Plak",
    group: "Reklam Grubu: Şeffaf Plak",
    keywords: ["şeffaf plak fiyatı", "invisalign randevu", "ortodonti uzmanı"],
  },
];

export function CampaignPreview() {
  return (
    <section id="onizleme" className="scroll-mt-24 border-t border-slate-100 bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-5">
        <div className="rounded-2xl border border-slate-100 bg-card p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </span>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Sektör Tespit Edildi</p>
                <p className="font-display text-sm font-semibold text-foreground">
                  Sağlık / Diş Kliniği
                </p>
              </div>
            </div>
            <div className="hidden h-8 w-px bg-slate-100 sm:block" />
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                <TrendingUp className="h-4 w-4 text-accent" />
              </span>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Tahmini Dönüşüm Potansiyeli
                </p>
                <p className="font-display text-sm font-semibold text-foreground">%18.4</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <article className="rounded-2xl border border-slate-100 bg-card shadow-sm">
            <div className="flex items-start justify-between gap-4 p-5">
              <div>
                <h3 className="font-display text-base font-semibold text-foreground">
                  {OPEN_CAMPAIGN.name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">{OPEN_CAMPAIGN.group}</p>
              </div>
              <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent">
                Açık
              </span>
            </div>
            <div className="border-t border-slate-100 p-5 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Anahtar Kelimeler
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {OPEN_CAMPAIGN.keywords.map((kw) => (
                  <li
                    key={kw}
                    className="rounded-lg border border-slate-100 bg-muted px-3 py-1.5 text-sm text-foreground"
                  >
                    {kw}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Negatif kelime listesi bu kampanya için hazırlandı.
              </div>
            </div>
          </article>

          <div className="relative">
            <div className="space-y-4 pb-20">
              {LOCKED_CAMPAIGNS.map((campaign) => (
                <article key={campaign.name} className="rounded-2xl border border-slate-100 bg-card shadow-sm">
                  <div className="flex items-start justify-between gap-4 p-5">
                    <div>
                      <h3 className="font-display text-base font-semibold text-foreground">
                        {campaign.name}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">{campaign.group}</p>
                    </div>
                    <span className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                      <Lock className="h-3 w-3" />
                      Kilitli
                    </span>
                  </div>
                  <div className="relative border-t border-slate-100 p-5 pt-4">
                    <div className="pointer-events-none select-none blur-sm">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Anahtar Kelimeler
                      </p>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {campaign.keywords.map((kw) => (
                          <li
                            key={kw}
                            className="rounded-lg border border-slate-100 bg-muted px-3 py-1.5 text-sm text-foreground"
                          >
                            {kw}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-4 text-sm text-muted-foreground">
                        Negatif kelimeler: ucuz, bedava, ikinci el, staj, iş ilanı
                      </p>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-b-2xl bg-background/55 px-4 text-center">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">
                        24 Adet Bütçe Yakan Negatif Kelime Gizlendi
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
              <button
                type="button"
                className="pointer-events-auto rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Tüm Kelimeleri Gör ve Google Ads'e Aktar (₺99)
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ChevronDown className="h-3.5 w-3.5" />
          Tüm kampanyalar Google Ads hesabınıza tek tıkla aktarılır.
        </p>
      </div>
    </section>
  );
}
