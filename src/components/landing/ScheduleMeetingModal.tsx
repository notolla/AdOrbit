import { CheckCircle2, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ScheduleMeetingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ScheduleMeetingModal({ open, onOpenChange }: ScheduleMeetingModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function resetForm() {
    setFullName("");
    setEmail("");
    setPhone("");
    setTopic("");
    setLoading(false);
    setSubmitted(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !topic.trim()) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg rounded-xl border-slate-200/80 p-0 shadow-sm">
        {submitted ? (
          <div className="flex flex-col items-center px-8 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#34A853]/30 bg-[#34A853]/8">
              <CheckCircle2 className="h-6 w-6 text-[#34A853]" strokeWidth={2} />
            </div>
            <h2 className="mt-6 font-display text-lg font-semibold tracking-tight text-slate-900">
              Randevunuz alındı
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
              Randevunuz alındı, en kısa sürede sizinle iletişime geçeceğiz.
            </p>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="btn-primary mt-8"
            >
              Tamam
            </button>
          </div>
        ) : (
          <>
            <div className="border-b border-slate-200/80 px-6 pb-5 pt-6">
              <DialogHeader>
                <p className="section-label">Randevu</p>
                <DialogTitle className="mt-2 font-display text-lg font-semibold tracking-tight text-slate-900">
                  Görüşme Ayarla
                </DialogTitle>
                <DialogDescription className="text-sm leading-relaxed text-slate-600">
                  Bilgilerinizi bırakın; Google Ads uzmanlarımız sizinle en kısa sürede iletişime
                  geçsin.
                </DialogDescription>
              </DialogHeader>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              <div>
                <label htmlFor="meeting-full-name" className="section-label">
                  Ad Soyad
                </label>
                <input
                  id="meeting-full-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Adınız Soyadınız"
                  className="input-field mt-2"
                />
              </div>

              <div>
                <label htmlFor="meeting-email" className="section-label">
                  E-posta
                </label>
                <input
                  id="meeting-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ad@sirketiniz.com"
                  className="input-field mt-2"
                />
              </div>

              <div>
                <label htmlFor="meeting-phone" className="section-label">
                  Telefon
                </label>
                <input
                  id="meeting-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+90 5XX XXX XX XX"
                  className="input-field mt-2"
                />
              </div>

              <div>
                <label htmlFor="meeting-topic" className="section-label">
                  Görüşmek istediğiniz konu
                </label>
                <textarea
                  id="meeting-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Kampanya kurulumu, bütçe optimizasyonu..."
                  rows={3}
                  className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-surface-raised px-3.5 py-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  "Randevu Talebi Gönder"
                )}
              </button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
