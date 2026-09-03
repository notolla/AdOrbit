import type { StrategyInput, StrategyReport } from "@/services/strategy-types";

export async function generateStrategyClient(input: StrategyInput): Promise<StrategyReport> {
  const response = await fetch("/api/generate-strategy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(120_000),
  });

  const payload = (await response.json().catch(() => ({}))) as StrategyReport | { message?: string };

  if (!response.ok) {
    throw new Error("message" in payload && payload.message ? payload.message : "Strateji oluşturulamadı.");
  }

  return payload as StrategyReport;
}
