import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { ModeSwitch } from "@/components/mode/ModeSwitch";
import { StandaloneWorkspace } from "@/components/standalone/StandaloneWorkspace";
import { LiveApiWorkspace } from "@/components/live/LiveApiWorkspace";
import { useAppMode } from "@/contexts/AppModeContext";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${BRAND.name} | Multi-Channel Reklam Otomasyonu` },
      {
        name: "description",
        content: BRAND.shortDescription,
      },
      { property: "og:title", content: `${BRAND.name} | Reklam Stratejisi ve Canlı API` },
      {
        property: "og:description",
        content: BRAND.shortDescription,
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { mode } = useAppMode();

  return (
    <main className="min-h-fit bg-background font-sans">
      <Navbar />
      <ModeSwitch />
      {mode === "standalone" ? <StandaloneWorkspace /> : <LiveApiWorkspace />}

      <footer className="border-t border-slate-200/60 bg-surface py-10">
        <div className="mx-auto max-w-6xl px-5 text-sm text-slate-500">
          {BRAND.name} — {BRAND.tagline}
        </div>
      </footer>
    </main>
  );
}
