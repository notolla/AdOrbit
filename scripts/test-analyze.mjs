import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");

for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const match = line.match(/^([A-Z0-9_]+)="(.*)"\s*$/);
  if (match) {
    process.env[match[1]] = match[2];
  }
}

const testUrl = process.argv[2] ?? "https://www.example.com";

const { scrapeWebsite } = await import("../src/services/scrape-website.ts");
const { analyzeWithGoogleAI } = await import("../src/services/google-ai-analysis.ts");

console.log(`\n🔍 Test URL: ${testUrl}\n`);

console.log("1) Site taranıyor...");
const scraped = await scrapeWebsite(testUrl);
console.log(JSON.stringify(scraped, null, 2));

console.log("\n2) Google AI analizi yapılıyor...");
const analysis = await analyzeWithGoogleAI(scraped);
console.log(JSON.stringify(analysis, null, 2));

console.log("\n✅ Test tamamlandı.\n");
