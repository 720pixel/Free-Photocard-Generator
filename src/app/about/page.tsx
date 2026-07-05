import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalPage from "@/components/marketing/LegalPage";
import { getPageContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "About Free Photocard Generator",
  description:
    "Free Photocard Generator is a free online photocard maker and editor. Design and publish news and social media photocards in your browser with no watermark and no signup.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Free Photocard Generator",
    description: "A free, browser-based photocard generator and editor for news and social media. No watermark, no signup.",
    url: "/about",
  },
};

export default async function AboutPage() {
  const page = await getPageContent("about");
  if (!page) notFound();
  return <LegalPage title={page.title} updated={page.updatedLabel ?? undefined} html={page.body} />;
}
