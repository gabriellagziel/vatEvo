import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://vatevo.com";
  const pages = ["", "/vida", "/solutions", "/compare", "/demo", "/contact"];
  const lastModified = new Date().toISOString();
  
  return pages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
}
