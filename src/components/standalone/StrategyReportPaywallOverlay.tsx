import type { ReactNode } from "react";
import { StrategyReportUnlockCard } from "@/components/standalone/StrategyReportUnlockCard";

type StrategyReportPaywallOverlayProps = {
  children?: ReactNode;
  onUnlock: (email: string) => Promise<void> | void;
};

export function StrategyReportPaywallOverlay({
  children,
  onUnlock,
}: StrategyReportPaywallOverlayProps) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[18%] bg-gradient-to-b from-transparent via-white/60 to-white/95 backdrop-blur-[1px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[32%] backdrop-blur-md"
        aria-hidden
      />
      <div className="absolute inset-0 flex items-center justify-center px-4 py-10">
        {children ?? <StrategyReportUnlockCard onUnlock={onUnlock} />}
      </div>
    </>
  );
}
