import { SITE_URL } from "@/lib/site";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/cart", "/checkout", "/orders", "/kitchen","/dashboard", "/signin", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}