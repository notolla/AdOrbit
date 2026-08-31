import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { CampaignPreview } from "@/components/landing/CampaignPreview";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AdBuilder AI | Google Ads Kampanyalarını 60 Saniyede Kur" },
      {
        name: "description",
        content:
          "Web sitenizi girin; yapay zeka sektörünüze özel reklam gruplarını, anahtar kelimeleri ve negatif kelimeleri 60 saniyede oluştursun.",
      },
      { property: "og:title", content: "AdBuilder AI | Yapay Zeka ile Google Ads Kurulumu" },
      {
        property: "og:description",
        content:
          "Niyet odaklı anahtar kelimeler, hazır reklam grupları ve bütçe koruyan negatif kelime listeleri.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <main className="min-h-screen bg-background font-sans">
      <Navbar />
      <Hero
        onSubmitted={() => {
          setShowPreview(true);
          requestAnimationFrame(() =>
            previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
          );
        }}
      />
      <div ref={previewRef}>{showPreview ? <CampaignPreview /> : null}</div>

      <footer className="border-t border-slate-100 py-8">
        <div className="mx-auto max-w-7xl px-5 text-sm text-muted-foreground">
          AdBuilder AI — Google Ads kampanya kurulum platformu
        </div>
      </footer>
    </main>
  );
}
