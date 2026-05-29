import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.ellcworth.com";
  const now = new Date();

  return [
    { url: `${base}/`,                                                 lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/about`,                                            lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/institutional`,                                    lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/insights`,                                         lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${base}/insights/uds-degree-certificates`,                lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/insights/university-of-ghana-80000-certificates`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/destinations/ghana`,                               lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/destinations/nigeria`,                             lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/destinations/kenya`,                               lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/destinations/sierra-leone`,                       lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/destinations/cote-divoire`,                       lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/services`,                                         lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/privacy`,                                          lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/terms`,                                            lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/cookies`,                                          lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];
}
