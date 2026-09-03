import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type StrategyReportUnlockCardProps = {
  onUnlock: (email: string) => Promise<void> | void;
  className?: string;
};

export function StrategyReportUnlockCard({ onUnlock, className = "" }: StrategyReportUnlockCardProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Geçerli bir kurumsal e-posta adresi girin.");
      return;
    }

    setLoading(true);
    try {
      await onUnlock(trimmed);
      toast.success("Tam rapor açıldı.");
    } catch {
      toast.error("Rapor açılamadı. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`pointer-events-auto w-full max-w-lg rounded-xl border border-slate-200 bg-white px-7 py-7 text-center shadow-2xl ${className}`}
    >
      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-800">
        Kilitli içerik
      </span>

      <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-slate-900">
        Tam strateji raporunu görüntüleyin
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        LinkedIn Ads ve Meta Ads kanal stratejileri, anahtar kelimeler, negatif listeler ve tüm
        reklam metinleri e-posta doğrulaması sonrası açılır.
      </p>

      <ul className="mt-4 space-y-1.5 text-left text-xs text-slate-500">
        <li>• 3 kanal kampanya stratejisi</li>
        <li>• Hedefleme parametreleri ve bütçe önerileri</li>
        <li>• PDF / HTML dışa aktarma</li>
      </ul>

      <form onSubmit={(event) => void handleSubmit(event)} className="mt-5 space-y-3 text-left">
        <label className="block text-xs font-medium text-slate-700">Kurumsal e-posta</label>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="ornek@sirket.com"
          className="input-field"
          autoComplete="email"
        />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Açılıyor…
            </>
          ) : (
            "Tam Raporu Aç"
          )}
        </button>
      </form>
    </div>
  );
}
