"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    question: "Google Ads hesabımın API yetkisini vermem gerekiyor mu?",
    answer:
      "Hayır. AdOrbit hesabınızın gizliliğini korumak için doğrudan tam entegrasyon yerine, Google Ads Editor uyumlu optimize edilmiş CSV aktarımı ve manuel yapılandırma sunar. Verileriniz tamamen güvende kalır.",
  },
  {
    question: "Yapay zeka hangi sektörler için kampanya üretebiliyor?",
    answer:
      "Gemini AI altyapısı; e-ticaret, B2B SaaS, yerel hizmetler ve kurumsal ajans projeleri dahil olmak üzere web sitenizin içeriğini analiz ederek her sektöre özel ticari niyetli kelimeler üretir.",
  },
  {
    question: "Negatif kelime havuzu nasıl çalışıyor?",
    answer:
      "Sistem, bütçenizi eritecek jenerik ve yanlış tıklama getirecek potansiyel kelimeleri otomatik olarak tespit edip negatif liste formatında hazırlar.",
  },
  {
    question: "Kurulum gerçekten 60 saniye mi sürüyor?",
    answer:
      "Evet! Web sitenizin URL'sini girmeniz yeterlidir; yapay zeka arka planda siteyi tarayarak kampanya yapısını, reklam gruplarını ve anahtar kelimeleri saniyeler içinde hazırlar.",
  },
] as const;

export function FAQ() {
  return (
    <section id="sss" className="border-b border-slate-200/60 bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-5">
        <header className="text-center sm:text-left">
          <p className="section-label">SSS</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.75rem]">
            Sıkça sorulan sorular
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            AdOrbit hakkında merak edilenler.
          </p>
        </header>

        <Accordion type="single" collapsible className="mt-10 space-y-3">
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`faq-${index}`}
              className="overflow-hidden rounded-xl border border-b border-slate-200/80 bg-card px-5 shadow-sm transition-all duration-200 hover:border-slate-300/90 data-[state=open]:border-[#4285F4]/25 data-[state=open]:shadow-[0_0_24px_-8px_rgba(66,133,244,0.15)]"
            >
              <AccordionTrigger className="py-4 text-left text-[0.9375rem] font-medium text-slate-900 hover:no-underline [&[data-state=open]]:text-[#4285F4]">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-sm leading-relaxed text-slate-600">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
