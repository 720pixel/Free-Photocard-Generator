import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Free Photocard Generator",
    short_name: "Photocard",
    description:
      "Free online photocard generator and editor. Design and publish news and social media photocards, no watermark, everything in your browser.",
    lang: "en",
    dir: "ltr",
    start_url: "/editor",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0e1020",
    theme_color: "#0e1020",
    categories: ["photo", "graphics", "productivity", "social"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
