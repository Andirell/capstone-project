// Creates /sitemap.xml so Google can find every job page

import { getData } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap() {
  const pages = [
    { url: SITE_URL },
    { url: SITE_URL + "/jobs" },
    { url: SITE_URL + "/companies" },
    { url: SITE_URL + "/about" },
    { url: SITE_URL + "/contact" },
  ];

  // Add the newest 50 jobs
  const jobs = await getData("/jobs/?page_size=50", { results: [] });
  for (const job of jobs.results) {
    pages.push({ url: SITE_URL + "/jobs/" + job.slug, lastModified: job.created_at });
  }

  return pages;
}
