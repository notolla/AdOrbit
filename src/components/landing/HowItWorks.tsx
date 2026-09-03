const STEPS = [
  {
    step: "01",
    title: "Web Sitenizi Girin",
    description:
      "Şirket URL'nizi sisteme yapıştırın, arka planda taramaya başlayalım.",
  },
  {
    step: "02",
    title: "Yapay Zeka Sektörü Analiz Etsin",
    description:
      "Gemini AI hedef kitlenizi, ticari niyetli anahtar kelimeleri ve bütçe koruma negatiflerini çıkarsın.",
  },
  {
    step: "03",
    title: "Google Ads'e Aktar",
    description:
      "Hazır kampanya yapısını tek tıkla hesabınıza aktarın veya CSV olarak indirin.",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="border-b border-slate-200/60 bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <header className="max-w-xl">
          <p className="section-label">Nasıl çalışır?</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.75rem]">
            60 saniyede Google Ads kampanyanızı nasıl kurarsınız?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Üç adımlık süreç; manuel kurulum yerine otomatik, tekrarlanabilir bir iş akışı.
          </p>
        </header>

        <div className="relative mt-14 md:mt-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[1.125rem] hidden h-px md:block"
          >
            <div className="mx-[calc(16.666%-0.5rem)] h-px bg-gradient-to-r from-slate-200/0 via-slate-300/70 to-slate-200/0" />
          </div>

          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {STEPS.map(({ step, title, description }, index) => (
              <article
                key={step}
                className="group relative rounded-xl border border-slate-200/80 bg-slate-50/50 p-6 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 sm:p-7"
              >
                {index < STEPS.length - 1 ? (
                  <div
                    aria-hidden="true"
                    className="absolute -right-3 top-1/2 hidden h-px w-5 bg-gradient-to-r from-slate-300/50 to-transparent md:block"
                  />
                ) : null}

                <div className="relative flex items-center gap-3">
                  <span className="font-mono text-[2rem] font-medium leading-none tracking-tighter text-slate-300 transition-all duration-200 group-hover:text-slate-400 sm:text-[2.25rem]">
                    {step}
                  </span>
                  <span
                    aria-hidden="true"
                    className="hidden h-1.5 w-1.5 rounded-full bg-slate-300/70 md:block"
                  />
                </div>

                <h3 className="mt-8 text-[0.9375rem] font-semibold tracking-tight text-slate-900">
                  {title}
                </h3>
                <p className="mt-2.5 text-sm leading-[1.65] text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
