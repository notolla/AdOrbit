import type { ReactNode } from "react";
import { StrategyReportUnlockCard } from "@/components/standalone/StrategyReportUnlockCard";

type StrategyReportPaywallOverlayProps = {
  children?: ReactNode;
  onUnlock: (email: string) => Promise<void> | void;
  userEmail?: string;
  userName?: string;
};

export function StrategyReportPaywallOverlay({
  children,
  onUnlock,
  userEmail,
  userName,
}: StrategyReportPaywallOverlayProps) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[12%] z-10 bg-gradient-to-b from-white/10 via-white/70 to-white/95"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[28%] z-10 backdrop-blur-md"
        aria-hidden
      />
      <div className="absolute inset-0 z-20 flex items-center justify-center px-4 py-12">
        {children ?? (
          <StrategyReportUnlockCard
            onUnlock={onUnlock}
            defaultEmail={userEmail}
            userName={userName}
          />
        )}
      </div>
    </>
  );
}
