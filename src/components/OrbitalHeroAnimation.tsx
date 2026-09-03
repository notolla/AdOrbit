import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const RINGS = [100, 82, 64, 46];

type OrbitNodeProps = {
  label: string;
  children: ReactNode;
  size?: "md" | "lg";
};

function OrbitNode({ label, children, size = "md" }: OrbitNodeProps) {
  return (
    <div
      title={label}
      className={cn(
        "flex items-center justify-center rounded-full border border-slate-200/80 bg-surface-raised shadow-sm transition-all duration-200",
        size === "lg" ? "h-14 w-14" : "h-12 w-12",
      )}
    >
      {children}
    </div>
  );
}

function ReactIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <circle cx="12" cy="12" r="2.2" fill="#64748b" />
      <g fill="none" stroke="#64748b" strokeWidth="1.1">
        <ellipse cx="12" cy="12" rx="9" ry="3.6" />
        <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)" />
      </g>
    </svg>
  );
}

function GoogleAdsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path d="M4.2 17.3 11.1 5.4a2.2 2.2 0 0 1 3.8 2.2L8 19.5a2.2 2.2 0 0 1-3.8-2.2Z" fill="#FBBC04" />
      <path d="M19.8 17.3 12.9 5.4a2.2 2.2 0 0 0-3.8 2.2L16 19.5a2.2 2.2 0 0 0 3.8-2.2Z" fill="#4285F4" />
      <circle cx="6.1" cy="18.4" r="2.4" fill="#34A853" />
    </svg>
  );
}

function OpenAiIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-foreground" aria-hidden="true">
      <path d="M21.6 10a5.4 5.4 0 0 0-.5-4.5 5.5 5.5 0 0 0-5.9-2.6A5.4 5.4 0 0 0 11.1 1a5.5 5.5 0 0 0-5.2 3.8A5.4 5.4 0 0 0 2.3 7.4a5.5 5.5 0 0 0 .7 6.4 5.4 5.4 0 0 0 .5 4.5 5.5 5.5 0 0 0 5.9 2.6A5.4 5.4 0 0 0 13.5 23a5.5 5.5 0 0 0 5.2-3.8 5.4 5.4 0 0 0 3.6-2.6 5.5 5.5 0 0 0-.7-6.4Zm-8.1 11.5a4.1 4.1 0 0 1-2.6-.9l.1-.1 4.4-2.5a.7.7 0 0 0 .4-.6v-6.2l1.8 1.1v5.1a4.1 4.1 0 0 1-4.1 4.1ZM4.6 17.6a4 4 0 0 1-.5-2.7l.1.1 4.4 2.5a.7.7 0 0 0 .7 0l5.4-3.1v2.1l-4.5 2.6a4.1 4.1 0 0 1-5.6-1.5ZM3.5 8.4a4.1 4.1 0 0 1 2.1-1.8v5.2a.7.7 0 0 0 .4.6l5.4 3.1-1.8 1L5 13.8a4.1 4.1 0 0 1-1.5-5.4Zm15.3 3.5-5.4-3.1 1.8-1L19.7 10a4.1 4.1 0 0 1-.6 7.4v-5.2a.7.7 0 0 0-.3-.3Zm1.8-2.7-.1-.1-4.4-2.6a.7.7 0 0 0-.7 0L10 9.7V7.6l4.5-2.6a4.1 4.1 0 0 1 6.1 4.2ZM9 12.9l-1.8-1V6.7a4.1 4.1 0 0 1 6.7-3.2l-.1.1L9.4 6.1a.7.7 0 0 0-.4.6Zm1-2.1 2.4-1.4 2.4 1.4v2.8l-2.4 1.4L10 13.6Z" />
    </svg>
  );
}

function GeminiIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M12 2.5 14.8 9.2 21.5 12 14.8 14.8 12 21.5 9.2 14.8 2.5 12 9.2 9.2Z"
      />
    </svg>
  );
}

type OrbitingNodeProps = {
  orbitSize: number;
  durationClass: string;
  counterClass: string;
  counterDuration?: string;
  startAngle: number;
  label: string;
  icon: ReactNode;
  nodeSize?: "md" | "lg";
};

function OrbitingNode({
  orbitSize,
  durationClass,
  counterClass,
  counterDuration,
  startAngle,
  label,
  icon,
  nodeSize = "md",
}: OrbitingNodeProps) {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2"
      style={{
        width: `${orbitSize}%`,
        height: `${orbitSize}%`,
        transform: `translate(-50%, -50%) rotate(${startAngle}deg)`,
      }}
    >
      <div className={cn("h-full w-full", durationClass)}>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
          <div
            className={cn(counterClass, counterDuration)}
            style={counterDuration ? { animationDuration: counterDuration } : undefined}
          >
            <div className="animate-float-node">
              <OrbitNode label={label} size={nodeSize}>
                {icon}
              </OrbitNode>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrbitalHeroAnimation() {
  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[440px] select-none"
      aria-hidden="true"
    >
      {RINGS.map((size) => (
        <div
          key={size}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200/70"
          style={{ width: `${size}%`, height: `${size}%` }}
        />
      ))}

      <div className="absolute left-1/2 top-1/2 h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2 animate-pulse-glow rounded-full bg-[radial-gradient(circle,rgba(100,116,139,0.12)_0%,rgba(148,163,184,0.06)_45%,rgba(255,255,255,0)_72%)]" />

      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <OrbitNode label="React" size="lg">
          <ReactIcon />
        </OrbitNode>
      </div>

      <OrbitingNode
        orbitSize={96}
        durationClass="animate-orbit-slow"
        counterClass="animate-orbit-reverse"
        counterDuration="36s"
        startAngle={0}
        label="Google Ads"
        icon={<GoogleAdsIcon />}
      />

      <OrbitingNode
        orbitSize={74}
        durationClass="animate-orbit-fast"
        counterClass="animate-orbit"
        counterDuration="22s"
        startAngle={180}
        label="OpenAI"
        icon={<OpenAiIcon />}
      />

      <OrbitingNode
        orbitSize={74}
        durationClass="animate-orbit"
        counterClass="animate-orbit-reverse"
        counterDuration="28s"
        startAngle={300}
        label="Gemini"
        icon={<GeminiIcon />}
      />
    </div>
  );
}
