import { APP_MODES, type AppMode } from "@/lib/app-mode";
import { useAppMode } from "@/contexts/AppModeContext";

const MODES: AppMode[] = ["standalone", "live-api"];

export function ModeSwitch() {
  const { mode, setMode } = useAppMode();

  return (
    <section className="border-b border-slate-200/70 bg-surface-raised/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">{APP_MODES[mode].description}</p>

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
