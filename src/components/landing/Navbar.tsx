import { useState } from "react";
import { ScheduleMeetingModal } from "@/components/landing/ScheduleMeetingModal";

const MENU = ["Ana Sayfa", "Servisler", "Kaynaklar", "Hakkımızda", "Projeler", "İletişim"];

export function Navbar() {
  const [lang, setLang] = useState<"TR" | "EN">("TR");
  const [meetingOpen, setMeetingOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5">
        <a href="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="flex h-7 w-7 flex-col items-center justify-center gap-0.5 rounded-md border border-slate-200 bg-surface-raised transition-all duration-200 group-hover:border-[#4285F4]/30">
            <span className="text-[10px] font-bold leading-none tracking-tighter text-slate-900">
              AO
            </span>
            <span aria-hidden="true" className="google-dots scale-[0.65]">
              <span />
              <span />
              <span />
              <span />
            </span>
          </span>
          <span className="text-sm font-semibold tracking-tight text-slate-900">
            Ad<span className="text-[#4285F4]">Orbit</span>
          </span>
        </a>

        <ul className="hidden items-center gap-6 lg:flex">
          {MENU.map((item) => (
            <li key={item}>
              <a
                href="#"
                className="text-sm text-slate-600 transition-all duration-200 hover:text-slate-900"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <div className="hidden items-center rounded-lg border border-slate-200 p-0.5 sm:flex">
            {(["TR", "EN"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                className={
                  lang === code
                    ? "rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white"
                    : "rounded-md px-2.5 py-1 text-xs font-medium text-slate-500 transition-all duration-200 hover:text-slate-900"
                }
              >
                {code}
              </button>
            ))}
          </div>

          <button type="button" onClick={() => setMeetingOpen(true)} className="btn-primary">
            Görüşme Ayarla
          </button>
        </div>
      </nav>

      <ScheduleMeetingModal open={meetingOpen} onOpenChange={setMeetingOpen} />
    </header>
  );
}
