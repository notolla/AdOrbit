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
      className={`surface-card pointer-events-auto w-full max-w-md border-slate-200/90 bg-white/95 px-6 py-6 text-center shadow-xl backdrop-blur-md ${className}`}
    >
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600">
        Tam rapor · 3 kanal stratejisi
      </span>

      <h3 className="mt-4 font-display text-base font-semibold tracking-tight text-slate-900">
        Kanal stratejilerini ve reklam metinlerini görüntüleyin
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Google Ads, LinkedIn Ads ve Meta Ads için hedefleme parametreleri, anahtar kelimeler,
        negatif listeler ve reklam metinlerinin tamamına erişmek için e-posta adresinizi girin.
      </p>

      <form onSubmit={(event) => void handleSubmit(event)} className="mt-5 space-y-3 text-left">
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
