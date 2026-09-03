import { BRAND } from "@/lib/brand";
import { formatStrategyBriefLines } from "@/lib/strategy-brief-labels";
import { CHANNEL_LABELS, type StrategyReport } from "@/services/strategy-types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(report: StrategyReport): string {
  const channelsHtml = report.channels
    .map(
      (channel) => `
      <section style="margin-top:28px;padding:20px;border:1px solid #e2e8f0;border-radius:12px;">
        <h2 style="margin:0 0 8px;font-size:18px;color:#0f172a;">${escapeHtml(CHANNEL_LABELS[channel.channel])}</h2>
        <p style="margin:0 0 12px;color:#475569;font-size:14px;">${escapeHtml(channel.objective)}</p>
        <p style="margin:0 0 8px;font-size:13px;"><strong>Hedefleme:</strong> ${escapeHtml(channel.targeting_summary)}</p>
        <p style="margin:0 0 8px;font-size:13px;"><strong>Bütçe:</strong> ${escapeHtml(channel.budget_recommendation_try)}</p>
        <p style="margin:0 0 8px;font-size:13px;"><strong>CTA:</strong> ${escapeHtml(channel.call_to_action)}</p>
        <p style="margin:12px 0 6px;font-size:13px;font-weight:600;">Hedefleme parametreleri</p>
        <ul>${channel.audience_parameters.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        ${
          channel.keywords.length
            ? `<p style="margin:12px 0 6px;font-size:13px;font-weight:600;">Anahtar kelimeler</p><ul>${channel.keywords.map((k) => `<li>${escapeHtml(k)}</li>`).join("")}</ul>`
            : ""
        }
        ${
          channel.negative_keywords.length
            ? `<p style="margin:12px 0 6px;font-size:13px;font-weight:600;">Negatif kelimeler</p><ul>${channel.negative_keywords.map((k) => `<li>${escapeHtml(k)}</li>`).join("")}</ul>`
            : ""
        }
        <p style="margin:12px 0 6px;font-size:13px;font-weight:600;">Başlıklar</p>
        <ul>${channel.headlines.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}</ul>
        <p style="margin:12px 0 6px;font-size:13px;font-weight:600;">Açıklamalar / Metinler</p>
        <ul>${channel.descriptions.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}</ul>
        <p style="margin:12px 0 0;font-size:13px;"><strong>Primary Text:</strong> ${escapeHtml(channel.primary_text)}</p>
      </section>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(BRAND.name)} Strateji Raporu</title>
  <style>
    body { font-family: Inter, Arial, sans-serif; color: #0f172a; padding: 32px; max-width: 900px; margin: 0 auto; }
    h1 { font-size: 24px; margin-bottom: 8px; }
    .meta { color: #64748b; font-size: 13px; margin-bottom: 24px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(BRAND.name)} — Multi-Channel Strateji Raporu</h1>
  <p class="meta">${escapeHtml(report.sector)} · ${new Date(report.generated_at).toLocaleString("tr-TR")}</p>
  <p><strong>Ürün/Hizmet:</strong> ${escapeHtml(report.product_service)}</p>
  <p><strong>Önerilen Hedef Kitle:</strong> ${escapeHtml(report.target_audience)}</p>
  ${
    report.brief
      ? `<p><strong>Strateji özeti:</strong> ${formatStrategyBriefLines(report.brief).map(escapeHtml).join(" · ")}</p>`
      : ""
  }
  ${
    report.website_url
      ? `<p><strong>Web Sitesi:</strong> ${escapeHtml(report.website_url)}</p>`
      : ""
  }
  ${
    report.website_insights
      ? `<p><strong>Site Analizi:</strong> ${escapeHtml(report.website_insights)}</p>`
      : ""
  }
  <p style="margin-top:16px;line-height:1.6;">${escapeHtml(report.executive_summary)}</p>
  ${channelsHtml}
</body>
</html>`;
}

export function downloadStrategyReportHtml(report: StrategyReport): void {
  const html = buildHtml(report);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `adorbit-strategy-${Date.now()}.html`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function printStrategyReportPdf(report: StrategyReport): void {
  const html = buildHtml(report);
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
