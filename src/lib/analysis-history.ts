import type { AnalysisSnapshot, WebsiteAnalysis } from "@/services/types";

const STORAGE_KEY = "adbuilder-analysis-history";
const MAX_SNAPSHOTS = 50;

function normalizeUrl(url: string): string {
  return url.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function readAllSnapshots(): AnalysisSnapshot[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AnalysisSnapshot[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAllSnapshots(snapshots: AnalysisSnapshot[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots.slice(0, MAX_SNAPSHOTS)));
}

function buildLabel(analysis: WebsiteAnalysis, version: number): string {
  const campaignName = analysis.campaigns[0]?.name ?? analysis.sector;
  return `${campaignName} · Revizyon v${version}`;
}

function nextVersion(snapshots: AnalysisSnapshot[], email: string, website: string): number {
  const normalizedEmail = normalizeEmail(email);
  const normalizedUrl = normalizeUrl(website);

  const existing = snapshots.filter(
    (item) =>
      normalizeEmail(item.email) === normalizedEmail &&
      normalizeUrl(item.website_url) === normalizedUrl,
  );

  if (existing.length === 0) return 1;
  return Math.max(...existing.map((item) => item.version)) + 1;
}

export function saveAnalysisSnapshot(input: {
  email: string;
  website_url: string;
  analysis: WebsiteAnalysis;
}): AnalysisSnapshot {
  const snapshots = readAllSnapshots();
  const version = nextVersion(snapshots, input.email, input.website_url);

  const snapshot: AnalysisSnapshot = {
    id: crypto.randomUUID(),
    version,
    website_url: input.website_url.trim(),
    email: input.email.trim(),
    sector: input.analysis.sector,
    label: buildLabel(input.analysis, version),
    created_at: new Date().toISOString(),
    analysis: input.analysis,
  };

  writeAllSnapshots([snapshot, ...snapshots]);
  return snapshot;
}

export function loadAnalysisHistory(email?: string): AnalysisSnapshot[] {
  const snapshots = readAllSnapshots().sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  if (!email?.trim()) return snapshots;

  const normalizedEmail = normalizeEmail(email);
  return snapshots.filter((item) => normalizeEmail(item.email) === normalizedEmail);
}

export function getSnapshotById(id: string): AnalysisSnapshot | null {
  return readAllSnapshots().find((item) => item.id === id) ?? null;
}

export function formatSnapshotDate(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatRelativeDate(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Bugün";
  if (diffDays === 1) return "Dün";
  if (diffDays < 7) return `${diffDays} gün önce`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
  return formatSnapshotDate(iso);
}
