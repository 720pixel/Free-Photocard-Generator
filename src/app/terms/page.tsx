import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalPage from "@/components/marketing/LegalPage";
import { getPageContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms for using Free Photocard Generator, a free online photocard maker for news and social media. Read the rules for acceptable use and content ownership.",
  alternates: { canonical: "/terms" },
  openGraph: { title: "Terms of Service | Free Photocard Generator", description: "The terms for using Free Photocard Generator.", url: "/terms" },
};

export default async function TermsPage() {
  const page = await getPageContent("terms");
  if (!page) notFound();
  return <LegalPage title={page.title} updated={page.updatedLabel ?? undefined} html={page.body} />;
}
