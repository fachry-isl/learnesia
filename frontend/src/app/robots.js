import { absoluteUrl } from "@/utils/seo";

const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "CCBot",
  "anthropic-ai",
  "ClaudeBot",
  "Google-Extended",
  "Bytespider",
  "PerplexityBot",
];

export default function robots() {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        disallow: "/",
      })),
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
