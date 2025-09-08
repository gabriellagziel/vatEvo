import type { MetadataRoute } from "next";

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://vatevo-marketing.vercel.app";
  const pages = ["", "/vida", "/solutions", "/compare", "/demo", "/contact"];
  const lastModified = new Date().toISOString();
  
  return pages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
}
