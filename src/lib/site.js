// The one place that knows the public address of the site.
// Locally it falls back to localhost; on Vercel we set SITE_URL to the deployed address.
// Server only (no NEXT_PUBLIC prefix): it is used by metadata, the sitemap and robots.txt.
export const SITE_URL = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");