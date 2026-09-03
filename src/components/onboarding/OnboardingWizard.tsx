import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { WizardProgress } from "@/components/onboarding/WizardProgress";
import {
  AUDIENCE_PROFILES,
  BUDGET_RANGES,
  CAMPAIGN_GOALS,
  COMMUNICATION_TONES,
  GEO_SCOPES,
  ONBOARDING_CHANNELS,
} from "@/lib/onboarding-options";
import {
  INITIAL_ONBOARDING_FORM,
  ONBOARDING_STEP_COUNT,
  firstNameFromFullName,
  type OnboardingFormData,
} from "@/lib/onboarding-types";
import type { StrategyChannel } from "@/services/strategy-types";
import { cn } from "@/lib/utils";

type OnboardingWizardProps = {
  loading: boolean;
  onSubmit: (data: OnboardingFormData) => void;
};

type OptionCardProps = {
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  multi?: boolean;
};

function OptionCard({ label, description, selected, onClick, multi }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "wizard-option-card w-full text-left",
        selected && "wizard-option-card-selected",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border",
            selected ? "border-slate-900 bg-slate-900" : "border-slate-300 bg-white",
          )}
        >
          {selected ? (
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          ) : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-slate-900">{label}</span>
          <span className="mt-1 block text-xs leading-relaxed text-slate-500">{description}</span>
        </span>
        {multi ? (
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Çoklu
          </span>
        ) : null}
      </div>
    </button>
  );
}

function stepTitle(step: number, firstName: string): string {
  const p = firstName ? `${firstName}, ` : "";
  const titles: Record<number, string> = {
    1: "Hoş geldiniz",
    2: `${p}temel bilgiler ve ürün`,
    3: `${p}yayın kanallarını seçin`,
    4: `${p}hedef kitle profili`,
    5: `${p}coğrafi kapsam`,
    6: `${p}kampanya hedefi`,
    7: `${p}bütçe aralığı`,
    8: `${p}iletişim dili ve tonu`,
  };
  return titles[step] ?? "";
}

export function OnboardingWizard({ loading, onSubmit }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<OnboardingFormData>(INITIAL_ONBOARDING_FORM);

  const firstName = firstNameFromFullName(form.user_name);
  const hasContact = Boolean(form.user_name.trim() && form.user_email.trim());

  function toggleChannel(channel: StrategyChannel) {
    setForm((current) => {
      const exists = current.channels.includes(channel);
      if (exists) {
        const next = current.channels.filter((item) => item !== channel);
        return { ...current, channels: next.length ? next : current.channels };
      }
      return { ...current, channels: [...current.channels, channel] };
    });
  }

  function selectField<K extends keyof OnboardingFormData>(key: K, value: OnboardingFormData[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function validateStep(): boolean {
    switch (step) {
      case 1:
        if (form.user_name.trim().length < 2) {
          toast.error("Adınızı girin.");
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.user_email.trim())) {
          toast.error("Geçerli bir e-posta adresi girin.");
          return false;
        }
        return true;
      case 2:
        if (form.product_service.trim().length < 3) {
          toast.error("Amiral gemisi ürün/hizmet alanını doldurun.");
          return false;
        }
        return true;
      case 3:
        if (form.channels.length === 0) {
          toast.error("En az bir yayın kanalı seçin.");
          return false;
        }
        return true;
      case 4:
        if (!form.audience_profile) {
          toast.error("Hedef kitle profili seçin.");
          return false;
        }
        return true;
      case 5:
        if (!form.geo_scope) {
          toast.error("Coğrafi kapsam seçin.");
          return false;
        }
        return true;
      case 6:
        if (!form.campaign_goal) {
          toast.error("Kampanya hedefi seçin.");
          return false;
        }
        return true;
      case 7:
        if (!form.budget_range) {
          toast.error("Bütçe aralığı seçin.");
          return false;
        }
        return true;
      case 8:
        if (!form.communication_tone) {
          toast.error("İletişim tonu seçin.");
          return false;
        }
        return true;
      default:
        return true;
    }
  }

  function handleNext() {
    if (!validateStep()) return;
    if (step < ONBOARDING_STEP_COUNT) {
      setStep((current) => current + 1);
      return;
    }
    onSubmit(form);
  }

  function handleBack() {
    if (step > 1) setStep((current) => current - 1);
  }

  return (
    <section className="border-b border-slate-200/60 bg-surface py-10 sm:py-12">
      <div className="mx-auto max-w-3xl px-5">
        <header className="mb-8">
          <p className="section-label">Onboarding</p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {hasContact && step > 1
              ? `Merhaba ${firstName}`
              : "Strateji ve rapor sihirbazı"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {hasContact && step > 1 ? (
              <>
                <span className="font-medium text-slate-800">{form.user_email}</span> için
                kanal stratejinizi adım adım oluşturalım.
              </>
            ) : (
              "Birkaç adımda kanal stratejinizi tanımlayın; web siteniz analiz edilerek kurumsal rapor üretilsin."
            )}
          </p>
        </header>

        <div className="surface-card p-6 sm:p-8">
          <WizardProgress currentStep={step} totalSteps={ONBOARDING_STEP_COUNT} />

          <div className="mt-8">
            <h2 className="text-base font-semibold capitalize text-slate-900">
              {stepTitle(step, firstName)}
            </h2>

            {step === 1 ? (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-700">Adınız</label>
                  <input
                    type="text"
                    autoComplete="name"
                    value={form.user_name}
                    onChange={(e) => selectField("user_name", e.target.value)}
                    placeholder="örn. Ahmet Yılmaz"
                    className="input-field mt-1.5"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">E-posta</label>
                  <input
                    type="email"
                    autoComplete="email"
                    value={form.user_email}
                    onChange={(e) => selectField("user_email", e.target.value)}
                    placeholder="ornek@sirket.com"
                    className="input-field mt-1.5"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Rapor ve hitaplar bu adres üzerinden kişiselleştirilir.
                  </p>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-700">Web sitesi URL</label>
                  <input
                    type="text"
                    inputMode="url"
                    value={form.website_url}
                    onChange={(e) => selectField("website_url", e.target.value)}
                    placeholder="örn. https://sirketiniz.com"
                    className="input-field mt-1.5"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Girildiğinde değer önerisi ve hizmetler otomatik analiz edilir.
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">
                    Amiral gemisi ürün / hizmet
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={form.product_service}
                    onChange={(e) => selectField("product_service", e.target.value)}
                    placeholder="Şu aralar öne çıkarmak istediğiniz ürün veya hizmeti kısaca anlatın…"
                    className="input-field mt-1.5 min-h-[88px] resize-y py-2.5"
                  />
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="mt-5 grid gap-3">
                {ONBOARDING_CHANNELS.map((channel) => (
                  <OptionCard
                    key={channel.id}
                    label={channel.label}
                    description={channel.description}
                    selected={form.channels.includes(channel.id)}
                    onClick={() => toggleChannel(channel.id)}
                    multi
                  />
                ))}
              </div>
            ) : null}

            {step === 4 ? (
              <div className="mt-5 grid gap-3">
                {AUDIENCE_PROFILES.map((option) => (
                  <OptionCard
                    key={option.id}
                    label={option.label}
                    description={option.description}
                    selected={form.audience_profile === option.id}
                    onClick={() => selectField("audience_profile", option.id)}
                  />
                ))}
              </div>
            ) : null}

            {step === 5 ? (
              <div className="mt-5 grid gap-3">
                {GEO_SCOPES.map((option) => (
                  <OptionCard
                    key={option.id}
                    label={option.label}
                    description={option.description}
                    selected={form.geo_scope === option.id}
                    onClick={() => selectField("geo_scope", option.id)}
                  />
                ))}
              </div>
            ) : null}

            {step === 6 ? (
              <div className="mt-5 grid gap-3">
                {CAMPAIGN_GOALS.map((option) => (
                  <OptionCard
                    key={option.id}
                    label={option.label}
                    description={option.description}
                    selected={form.campaign_goal === option.id}
                    onClick={() => selectField("campaign_goal", option.id)}
                  />
                ))}
              </div>
            ) : null}

            {step === 7 ? (
              <div className="mt-5 grid gap-3">
                {BUDGET_RANGES.map((option) => (
                  <OptionCard
                    key={option.id}
                    label={option.label}
                    description={option.description}
                    selected={form.budget_range === option.id}
                    onClick={() => selectField("budget_range", option.id)}
                  />
                ))}
              </div>
            ) : null}

            {step === 8 ? (
              <div className="mt-5 grid gap-3">
                {COMMUNICATION_TONES.map((option) => (
                  <OptionCard
                    key={option.id}
                    label={option.label}
                    description={option.description}
                    selected={form.communication_tone === option.id}
                    onClick={() => selectField("communication_tone", option.id)}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200/80 pt-6">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1 || loading}
              className="btn-secondary min-w-[100px] disabled:opacity-40"
            >
              Geri
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="btn-primary min-w-[160px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Oluşturuluyor…
                </>
              ) : step === ONBOARDING_STEP_COUNT ? (
                "Strateji Raporu Oluştur"
              ) : (
                "Devam"
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
