import { toast } from "sonner";
import { APP_MODES, type AppMode } from "@/lib/app-mode";
import { useAppMode } from "@/contexts/AppModeContext";
import { clearAppHistory } from "@/lib/clear-app-history";

const MODES: AppMode[] = ["standalone", "live-api"];

export function ModeSwitch() {
  const { mode, setMode } = useAppMode();

  function handleClearHistory() {
    clearAppHistory();
    toast.success("Geçmiş temizlendi.");
    window.location.reload();
  }

  return (
    <section className="border-b border-slate-200/70 bg-surface-raised/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
          <p className="text-sm text-slate-600">{APP_MODES[mode].description}</p>
          <button
            type="button"
            onClick={handleClearHistory}
            className="self-start text-xs font-medium text-slate-400 underline-offset-2 transition-colors hover:text-slate-700 hover:underline sm:self-auto"
          >
            Geçmişi sil
          </button>
        </div>

        <div
          className="segment-control inline-flex w-full sm:w-auto"
          role="tablist"
          aria-label="Çalışma modu"
        >
          {MODES.map((item) => {
            const active = mode === item;

            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMode(item)}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors sm:min-w-[168px] sm:flex-initial ${
                  active
                    ? "segment-control-active"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {APP_MODES[item].shortLabel}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
