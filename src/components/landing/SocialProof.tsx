const GOOGLE_COLORS = ["#4285F4", "#EA4335", "#FBBC05", "#34A853"] as const;

const AVATARS = [
  {
    src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=80&h=80&q=80",
    alt: "Pazarlama direktörü",
  },
  {
    src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&h=80&q=80",
    alt: "Performans pazarlama uzmanı",
  },
  {
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&h=80&q=80",
    alt: "Growth marketing lead",
  },
  {
    src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=80&h=80&q=80",
    alt: "Dijital ajans yöneticisi",
  },
  {
    src: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=80&h=80&q=80",
    alt: "Google Ads uzmanı",
  },
] as const;

function GoogleDots() {
  return (
    <span aria-hidden="true" className="inline-flex items-center gap-1">
      {GOOGLE_COLORS.map((color) => (
        <span
          key={color}
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </span>
  );
}

export function SocialProof() {
  return (
    <section className="border-b border-slate-200/60 bg-surface py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-5">
        <div className="surface-card flex flex-col items-start gap-5 px-5 py-5 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
          <div className="flex shrink-0 items-center">
            <div className="flex -space-x-2.5">
              {AVATARS.map((avatar, index) => (
                <img
                  key={avatar.src}
                  src={avatar.src}
                  alt={avatar.alt}
                  loading="lazy"
                  className="h-9 w-9 rounded-full border-2 bg-surface-raised object-cover ring-2 ring-surface-raised sm:h-10 sm:w-10"
                  style={{ borderColor: GOOGLE_COLORS[index % GOOGLE_COLORS.length] }}
                />
              ))}
            </div>
            <span
              aria-hidden="true"
              className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[10px] font-semibold text-slate-600 ring-2 ring-surface-raised sm:h-10 sm:w-10 sm:text-[11px]"
            >
              +415
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem]">
              <span className="font-semibold text-[#4285F4]">420+</span>{" "}
              <span className="font-medium text-slate-800">pazarlama ekibi</span>{" "}
              <span className="text-slate-600">kampanya kurulumunu</span>{" "}
              <span
                className="font-semibold"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #4285F4 0%, #EA4335 35%, #FBBC05 65%, #34A853 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                AdOrbit
              </span>{" "}
              <span className="font-medium text-[#34A853]">ile otomatikleştiriyor.</span>
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <GoogleDots />
            <span className="pill-badge hidden border-[#4285F4]/20 bg-[#4285F4]/5 text-slate-600 sm:inline-flex">
              Google Ads uyumlu
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
