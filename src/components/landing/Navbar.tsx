import { Phone, Sparkles } from "lucide-react";
import { useState } from "react";

const MENU = ["Ana Sayfa", "Servisler", "Kaynaklar", "Hakkımızda", "Projeler", "İletişim"];

export function Navbar() {
  const [lang, setLang] = useState<"TR" | "EN">("TR");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-background/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5">
        <a href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={2.2} />
          </span>
          <span className="font-display text-[17px] font-bold tracking-tight text-foreground">
            AdBuilder AI
          </span>
        </a>

        <ul className="hidden items-center gap-7 lg:flex">
          {MENU.map((item) => (
            <li key={item}>
              <a
                href="#"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Telefon ile ara"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-100 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Phone className="h-4 w-4" />
          </button>

          <div className="hidden items-center rounded-lg border border-slate-100 p-0.5 sm:flex">
            {(["TR", "EN"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                className={
                  lang === code
                    ? "rounded-md bg-foreground px-2.5 py-1 text-xs font-semibold text-background"
                    : "rounded-md px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                }
              >
                {code}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Görüşme Ayarla
          </button>
        </div>
      </nav>
    </header>
  );
}
