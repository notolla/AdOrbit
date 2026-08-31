import { useState, type FormEvent } from "react";
import { ArrowRight, Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { OrbitVisual } from "./OrbitVisual";

const BADGES = ["Google Ads API Entegre", "OpenAI Destekli", "KVKK Uyumlu"];

export function Hero({ onSubmitted }: { onSubmitted: () => void }) {
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!website.trim() || !email.trim()) {
      toast.error("Lütfen web sitesi adresinizi ve e-posta adresinizi girin.");
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("leads")
      .insert({ website_url: website.trim(), email: email.trim() });
    setLoading(false);

    if (error) {
      toast.error("Kayıt sırasında bir sorun oluştu. Lütfen tekrar deneyin.");
      return;
    }
    toast.success("Kampanya önizlemeniz hazırlandı.");
    onSubmitted();
  }

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-14 sm:pt-20">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Yapay zeka destekli Google Ads kurulumu
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Google Ads Reklamlarınızı Yapay Zeka ile 60 Saniyede Kurun
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Web sitenizi girin; sektörünüze özel reklam gruplarını, niyet odaklı anahtar kelimeleri
            ve bütçe yakan negatif kelimeleri otomatik oluşturalım.
          </p>
        </div>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2">
          <div>
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-slate-100 bg-card p-5 shadow-sm sm:p-6"
            >
              <label
                htmlFor="website"
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Web Sitesi Adresiniz
              </label>
              <input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="örnek: websiteadresiniz.com"
                className="mt-2 h-14 w-full rounded-xl border border-input bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
              />

              <label
                htmlFor="email"
                className="mt-5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                E-posta Adresiniz
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ad@sirketiniz.com"
                className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
              />

              <button
                type="submit"
                disabled={loading}
                className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-accent/90 disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                60 Saniyede Kampanyanı Oluştur
              </button>

              <ul className="mt-5 flex flex-wrap gap-2">
                {BADGES.map((badge) => (
                  <li
                    key={badge}
                    className="rounded-full border border-slate-100 bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground"
                  >
                    {badge}
                  </li>
                ))}
              </ul>
            </form>

            <div className="mt-5 flex items-center gap-4 rounded-2xl border border-slate-100 bg-card p-4 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80"
                alt="Bilgisayar başında çalışan gülümseyen profesyonel"
                loading="lazy"
                className="h-14 w-14 shrink-0 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">420+ pazarlama ekibi</span>{" "}
                  kampanyalarını AdBuilder AI ile kuruyor.
                </p>
              </div>
            </div>
          </div>

          <div className="order-first lg:order-last">
            <OrbitVisual />
          </div>
        </div>
      </div>
    </section>
  );
}
