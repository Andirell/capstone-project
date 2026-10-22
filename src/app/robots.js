// Creates /robots.txt (tells search engines which pages not to show)

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/login", "/register"] },
    sitemap: SITE_URL + "/sitemap.xml",
  };
}
