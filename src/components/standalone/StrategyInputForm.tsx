import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

const EXAMPLES = [
  "Red Team / Sızma Testi Hizmeti",
  "SIEM & SOC Platformu",
  "Kurumsal EDR Çözümü",
];

type StrategyInputFormProps = {
  loading: boolean;
  onSubmit: (input: {
    website_url: string;
    product_service: string;
    industry_notes: string;
    email: string;
  }) => void;
};

export function StrategyInputForm({ loading, onSubmit }: StrategyInputFormProps) {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [productService, setProductService] = useState("");
  const [industryNotes, setIndustryNotes] = useState("");
  const [email, setEmail] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({
      website_url: websiteUrl.trim(),
      product_service: productService.trim(),
      industry_notes: industryNotes.trim(),
      email: email.trim(),
    });
  }

  return (
    <section className="border-b border-slate-200/60 bg-surface py-12">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="section-label">Bağımsız mod</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">
            Çok kanallı reklam stratejisi ve rapor
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Google Ads, LinkedIn Ads ve Meta Ads için kanal bazlı kampanya stratejileri, hedefleme
            parametreleri ve reklam metinleri — hesap bağlantısı olmadan.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {EXAMPLES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setProductService(item)}
                className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="surface-card space-y-3.5 p-5">
          <div>
            <label className="text-xs font-medium text-slate-700">Web Sitesi URL (opsiyonel)</label>
            <input
              type="text"
              inputMode="url"
              autoComplete="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="örn. https://akhanklinik.com (ürün veya hizmetin web adresi)"
              className="input-field mt-1.5"
            />
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              Girildiğinde site analiz edilir; teklifler ve çözümler stratejiye yansıtılır.
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700">Ürün / Hizmet</label>
            <input
              required
              value={productService}
              onChange={(e) => setProductService(e.target.value)}
              placeholder="örn. Red Team, SIEM, Sızma Testi"
              className="input-field mt-1.5"
            />
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              Hedef kitle otomatik önerilir.
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700">Ek sektör notları (opsiyonel)</label>
            <input
              value={industryNotes}
              onChange={(e) => setIndustryNotes(e.target.value)}
              placeholder="örn. KVKK uyumu, SOC 2, Türkiye pazarı"
              className="input-field mt-1.5"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700">E-posta (opsiyonel)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tam raporu doğrudan açmak için"
              className="input-field mt-1.5"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {websiteUrl.trim()
                  ? "Analiz ediliyor…"
                  : "Oluşturuluyor…"}
              </>
            ) : (
              "Strateji Raporu Oluştur"
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
