import type { ScrapedPageData } from "./types";

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripHtmlTags(value: string): string {
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function extractBodySnippet(html: string, maxLength = 6000): string {
  const withoutNoise = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");

  return stripHtmlTags(withoutNoise).slice(0, maxLength);
}

function extractHeadings(html: string): string[] {
  const matches = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
  return matches
    .map((match) => stripHtmlTags(match[1] ?? ""))
    .filter(Boolean)
    .slice(0, 12);
}

function matchMetaContent(html: string, name: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${name}["']`,
      "i",
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return stripHtmlTags(match[1]);
    }
  }

  return null;
}

export async function scrapeWebsite(rawUrl: string): Promise<ScrapedPageData> {
  const url = normalizeUrl(rawUrl);

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; AdOrbit/1.0)",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(15_000),
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Siteye erişilemedi (HTTP ${response.status}).`);
  }

  const html = await response.text();

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);

  const metaDescription =
    matchMetaContent(html, "description") ??
    matchMetaContent(html, "og:description") ??
    matchMetaContent(html, "twitter:description");

  return {
    url,
    title: titleMatch?.[1] ? stripHtmlTags(titleMatch[1]) : null,
    metaDescription,
    h1: h1Match?.[1] ? stripHtmlTags(h1Match[1]) : null,
    bodySnippet: extractBodySnippet(html),
    headings: extractHeadings(html),
  };
}
