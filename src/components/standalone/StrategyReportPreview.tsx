import {
  CHANNEL_COLORS,
  CHANNEL_LABELS,
  type ChannelStrategy,
  type StrategyReport,
} from "@/services/strategy-types";
import { downloadStrategyReportHtml, printStrategyReportPdf } from "@/lib/strategy-export";
import { formatStrategyBriefLines } from "@/lib/strategy-brief-labels";
import { StrategyReportPaywallOverlay } from "@/components/standalone/StrategyReportPaywallOverlay";

type StrategyReportPreviewProps = {
  report: StrategyReport;
  unlocked: boolean;
  onUnlock: (email: string) => Promise<void> | void;
};

function ChannelCard({
  channel,
  lockedDetail,
}: {
  channel: ChannelStrategy;
  lockedDetail?: boolean;
}) {
  return (
    <article className="surface-card overflow-hidden">
      <div
        className="border-b border-slate-200/80 px-5 py-3.5"
        style={{ borderLeftWidth: 4, borderLeftColor: CHANNEL_COLORS[channel.channel] }}
      >
        <h3 className="text-sm font-semibold text-slate-900">{CHANNEL_LABELS[channel.channel]}</h3>
        <p className="mt-1 text-xs text-slate-500">{channel.objective}</p>
      </div>
      <div className="grid gap-5 p-5 lg:grid-cols-2">
        <div className="space-y-2.5 text-sm">
          <p>
            <span className="font-medium text-slate-900">Hedefleme: </span>
            {channel.targeting_summary}
          </p>
          <p>
            <span className="font-medium text-slate-900">Bütçe: </span>
            {channel.budget_recommendation_try}
          </p>
          <p>
            <span className="font-medium text-slate-900">CTA: </span>
            {channel.call_to_action}
          </p>
          <div>
            <p className="font-medium text-slate-900">Hedefleme parametreleri</p>
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {channel.audience_parameters.map((item) => (
                <li key={item} className="pill-badge">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div
          className={`space-y-2.5 text-sm ${lockedDetail ? "select-none blur-[3px] opacity-60" : ""}`}
        >
          {channel.keywords.length ? (
            <div>
              <p className="font-medium text-slate-900">Anahtar kelimeler</p>
              <ul className="mt-1 flex flex-wrap gap-1.5">
                {channel.keywords.map((kw) => (
                  <li key={kw} className="pill-badge">
                    {kw}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {channel.negative_keywords.length ? (
            <div>
              <p className="font-medium text-slate-900">Negatif kelimeler</p>
              <ul className="mt-1 flex flex-wrap gap-1.5">
                {channel.negative_keywords.map((kw) => (
                  <li key={kw} className="pill-badge text-slate-500">
                    -{kw}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div>
            <p className="font-medium text-slate-900">Başlıklar</p>
            <ul className="mt-1 space-y-1 text-slate-700">
              {channel.headlines.map((h) => (
                <li key={h}>• {h}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium text-slate-900">Açıklamalar</p>
            <ul className="mt-1 space-y-1 text-slate-700">
              {channel.descriptions.map((d) => (
                <li key={d}>• {d}</li>
              ))}
            </ul>
          </div>
          <p className="text-slate-700">
            <span className="font-medium text-slate-900">Primary text: </span>
            {channel.primary_text}
          </p>
        </div>
      </div>
    </article>
  );
}

export function StrategyReportPreview({ report, unlocked, onUnlock }: StrategyReportPreviewProps) {
  const [previewChannel, ...lockedChannels] = report.channels;

  return (
    <section id="strategy-report" className="scroll-mt-20 border-b border-slate-200/60 bg-surface py-12">
      <div className="mx-auto max-w-5xl px-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="section-label">Strateji raporu</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-slate-900">
              {report.sector}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{report.executive_summary}</p>
            <p className="mt-2 text-xs text-slate-500">{report.product_service}</p>
            {report.brief ? (
              <ul className="mt-3 grid gap-1 rounded-lg border border-slate-200/80 bg-white px-3 py-2.5 text-xs text-slate-600 sm:grid-cols-2">
                {formatStrategyBriefLines(report.brief).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : null}
            <p className="mt-3 rounded-lg border border-slate-200/80 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-700">
              <span className="font-medium text-slate-900">Önerilen hedef kitle:</span>{" "}
              {report.target_audience}
            </p>
            {report.website_url ? (
              <p className="mt-2 text-xs text-slate-500">
                Web sitesi:{" "}
                <a
                  href={report.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-700 underline-offset-2 hover:underline"
                >
                  {report.website_url}
                </a>
              </p>
            ) : null}
            {report.website_insights ? (
              <p
                className={`mt-2 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs leading-relaxed text-slate-600 ${!unlocked ? "select-none blur-[2px] opacity-70" : ""}`}
              >
                <span className="font-medium text-slate-700">Site analizi:</span>{" "}
                {report.website_insights}
              </p>
            ) : null}
            {!unlocked ? (
              <p className="mt-3 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-800">
                Önizleme modu — kanal detayları kilitli
              </p>
            ) : null}
          </div>

          {unlocked ? (
            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={() => printStrategyReportPdf(report)}
                className="btn-secondary"
              >
                PDF Olarak Yazdır
              </button>
              <button
                type="button"
                onClick={() => downloadStrategyReportHtml(report)}
                className="btn-primary"
              >
                Raporu Dışa Aktar
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500 sm:max-w-[200px] sm:text-right">
              Tam rapor ve dışa aktarma için e-posta doğrulaması gerekir.
            </p>
          )}
        </header>

        <div className="relative mt-6 min-h-[520px]">
          <div className="space-y-4 pb-8">
            {previewChannel ? (
              <ChannelCard channel={previewChannel} lockedDetail={!unlocked} />
            ) : null}

            {lockedChannels.map((channel) => (
              <div
                key={channel.channel}
                className={!unlocked ? "select-none blur-[5px] opacity-50" : undefined}
              >
                <ChannelCard channel={channel} />
              </div>
            ))}
          </div>

          {!unlocked ? <StrategyReportPaywallOverlay onUnlock={onUnlock} /> : null}
        </div>
      </div>
    </section>
  );
}
