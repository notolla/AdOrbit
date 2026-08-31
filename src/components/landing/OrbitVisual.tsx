const ICONS = [
  {
    label: "Google Ads",
    top: "8%",
    left: "62%",
    node: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M4.2 17.3 11.1 5.4a2.2 2.2 0 0 1 3.8 2.2L8 19.5a2.2 2.2 0 0 1-3.8-2.2Z" fill="#FBBC04" />
        <path d="M19.8 17.3 12.9 5.4a2.2 2.2 0 0 0-3.8 2.2L16 19.5a2.2 2.2 0 0 0 3.8-2.2Z" fill="#4285F4" />
        <circle cx="6.1" cy="18.4" r="2.4" fill="#34A853" />
      </svg>
    ),
  },
  {
    label: "OpenAI",
    top: "26%",
    left: "12%",
    node: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-foreground" aria-hidden="true">
        <path d="M21.6 10a5.4 5.4 0 0 0-.5-4.5 5.5 5.5 0 0 0-5.9-2.6A5.4 5.4 0 0 0 11.1 1a5.5 5.5 0 0 0-5.2 3.8A5.4 5.4 0 0 0 2.3 7.4a5.5 5.5 0 0 0 .7 6.4 5.4 5.4 0 0 0 .5 4.5 5.5 5.5 0 0 0 5.9 2.6A5.4 5.4 0 0 0 13.5 23a5.5 5.5 0 0 0 5.2-3.8 5.4 5.4 0 0 0 3.6-2.6 5.5 5.5 0 0 0-.7-6.4Zm-8.1 11.5a4.1 4.1 0 0 1-2.6-.9l.1-.1 4.4-2.5a.7.7 0 0 0 .4-.6v-6.2l1.8 1.1v5.1a4.1 4.1 0 0 1-4.1 4.1ZM4.6 17.6a4 4 0 0 1-.5-2.7l.1.1 4.4 2.5a.7.7 0 0 0 .7 0l5.4-3.1v2.1l-4.5 2.6a4.1 4.1 0 0 1-5.6-1.5ZM3.5 8.4a4.1 4.1 0 0 1 2.1-1.8v5.2a.7.7 0 0 0 .4.6l5.4 3.1-1.8 1L5 13.8a4.1 4.1 0 0 1-1.5-5.4Zm15.3 3.5-5.4-3.1 1.8-1L19.7 10a4.1 4.1 0 0 1-.6 7.4v-5.2a.7.7 0 0 0-.3-.3Zm1.8-2.7-.1-.1-4.4-2.6a.7.7 0 0 0-.7 0L10 9.7V7.6l4.5-2.6a4.1 4.1 0 0 1 6.1 4.2ZM9 12.9l-1.8-1V6.7a4.1 4.1 0 0 1 6.7-3.2l-.1.1L9.4 6.1a.7.7 0 0 0-.4.6Zm1-2.1 2.4-1.4 2.4 1.4v2.8l-2.4 1.4L10 13.6Z" />
      </svg>
    ),
  },
  {
    label: "Supabase",
    top: "52%",
    left: "72%",
    node: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M13.2 22.6c-.6.7-1.7.3-1.7-.6l-.3-8.2h5.5c1 0 1.6 1.2 1 2Z" fill="#3ECF8E" />
        <path d="M10.8 1.4c.6-.7 1.7-.3 1.7.6l.3 8.2H7.3c-1 0-1.6-1.2-1-2Z" fill="#3ECF8E" opacity=".55" />
      </svg>
    ),
  },
  {
    label: "React",
    top: "44%",
    left: "34%",
    node: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <circle cx="12" cy="12" r="2" fill="#3b82f6" />
        <g fill="none" stroke="#3b82f6" strokeWidth="1.1">
          <ellipse cx="12" cy="12" rx="9" ry="3.6" />
          <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)" />
        </g>
      </svg>
    ),
  },
];

export function OrbitVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[440px]">
      {[100, 78, 56, 34].map((size) => (
        <div
          key={size}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-100"
          style={{ width: `${size}%`, height: `${size}%` }}
        />
      ))}

      <div className="absolute left-1/2 top-1/2 h-[22%] w-[22%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5" />

      {ICONS.map((icon) => (
        <div
          key={icon.label}
          title={icon.label}
          className="absolute flex h-12 w-12 items-center justify-center rounded-full border border-slate-100 bg-card shadow-sm"
          style={{ top: icon.top, left: icon.left }}
        >
          {icon.node}
        </div>
      ))}
    </div>
  );
}
