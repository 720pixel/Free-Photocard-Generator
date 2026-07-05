import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE = "https://photocard.720p.red";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Free Photocard Generator | Online News and Social Media Photocard Maker | বাংলা ফটোকার্ড জেনারেটর",
    template: "%s | Free Photocard Generator",
  },
  description:
    "Free online photocard generator and editor. Design and publish news and social media photocards for Facebook, Instagram, YouTube and more in seconds. No watermark, no signup, everything in your browser. ৫০+ ফ্রি বাংলা নিউজ ফটোকার্ড টেমপ্লেট।",
  keywords: [
    "photocard generator",
    "photocard maker",
    "photocard editor",
    "free photocard generator",
    "online photocard maker",
    "news photocard maker",
    "social media photocard",
    "social media post maker",
    "instagram post generator",
    "facebook post maker",
    "news card generator",
    "quote card maker",
    "photo card editor online",
    "no watermark photocard",
    "Bangla photocard generator",
    "নিউজ ফটোকার্ড",
    "ফটোকার্ড মেকার",
    "বাংলা ফটোকার্ড জেনারেটর",
    "ফটোকার্ড ডিজাইন",
    "নিউজ কার্ড মেকার",
    "ফেসবুক পোস্ট ডিজাইন",
    "ফ্রি টেমপ্লেট",
  ],
  applicationName: "Free Photocard Generator",
  alternates: { canonical: "/", languages: { bn: "/", en: "/?lang=en" } },
  icons: {
    icon: [
      // Google Search favicon: square, multiples of 48px (48/96/144/192/512).
      // favicon.ico (48x48) is emitted automatically from src/app/favicon.ico.
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/icon-96.png", type: "image/png", sizes: "96x96" },
      { url: "/icon-144.png", type: "image/png", sizes: "144x144" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "Free Photocard Generator",
    title: "Free Photocard Generator | Online Social Media Photocard Maker",
    description: "Design and publish news and social media photocards in seconds. No watermark, everything in your browser.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Free Photocard Generator" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Photocard Generator",
    description: "Design and publish social media photocards in seconds. No watermark, no signup.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#6d28d9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark');}catch(e){}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
