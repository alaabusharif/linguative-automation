import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/content/site";
import { solutions } from "@/lib/content/solutions";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/solutions",
    "/projects",
    "/about",
    "/insights",
    "/contact",
  ];

  const solutionRoutes = solutions.map((s) => s.href);

  return [...staticRoutes, ...solutionRoutes].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
