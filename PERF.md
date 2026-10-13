# Performance: evidence and trade-offs

## What the available measurements say

These are historical readings recorded during Days 43–45. They are not a
current benchmark of the code in this checkout and are not a guarantee for a
new deployment.

| Home-page measure | Day 43 baseline | Day 45 local production | Day 45 Vercel |
| --- | ---: | ---: | ---: |
| Lighthouse performance | 71 | 87 | 94 |
| LCP | 6.1 s | 2.9 s median | 1.8 s median |
| CLS | 0 | 0 | 0 |
| Hero image | 1.2 MB source | 66 kB served | Not recorded |
| `/menu` JavaScript transferred | Not recorded | 171 kB | 173 kB |

The recorded local menu JavaScript was above the then-used 120 kB target.
Lighthouse LCP varied between runs; an earlier three-run median was 3.3 seconds.
Treat small differences as noise.

An additional Lighthouse result shared on October 13, 2026 reported a
performance score of 74, FCP 0.9 s, LCP 3.5 s, TBT 680 ms, CLS 0.002, and Speed
Index 1.2 s. The excerpt did not identify the audited route or LCP element, so
it is a provisional baseline rather than a directly comparable homepage
measurement. Lighthouse also warned that IndexedDB data may affect the run.
This app does not use IndexedDB; repeat the audit in an Incognito window before
comparing results.

## What improved the result

- The oversized hero image was replaced/served in a smaller optimized form;
  this was the largest recorded improvement to LCP.
- Images have explicit dimensions so the browser can reserve layout space.
- `next/font` serves the configured font locally, avoiding a third-party font
  request.
- The home page and menu retain static rendering where the data allows it;
  menu updates use API requests rather than making the entire route dynamic.
- Charts are rendered only on staff pages; they do not add chart code to the
  public home page.
- Google sign-in uses a native server-rendered link and server-side OAuth
  redirects rather than loading Google's client SDK on page load. This keeps
  third-party authentication JavaScript out of the sign-in page's critical
  rendering path.
- The first menu dish image is prioritized because it can be the menu page's
  LCP element; later menu and home-special images remain lazy-loaded so they
  do not compete with the homepage hero image.
- The static menu's first page now renders its filters and dish cards in the
  initial HTML. URL page state is synchronized after hydration, avoiding a
  client-rendered fallback for the whole menu while keeping client-side
  filtering and pagination.
- Responsive image `sizes` match the content gutters and grid columns more
  closely, avoiding requests for unnecessarily wide variants on small screens.
- The homepage hero source is now a 1200-by-1200 WebP at about 144 KiB, down
  from the 1600-by-1600 JPEG at about 293 KiB. The image remains eagerly
  prioritized. For the 1080-pixel, quality-75 WebP variant, the local Next.js
  image optimizer returned 119,868 bytes from the new source versus 139,652
  bytes from the old one (about 14% fewer bytes). This is a local image
  response comparison, not a Lighthouse LCP measurement.
- The shared account header now uses a cancellable native fetch instead of
  SWR for its single session request. SWR remains on the menu, where it is used
  for interactive filtering and pagination, but is no longer pulled into every
  route just for the account status.

## What to say in the presentation

“The historical home-page Lighthouse score moved from 71 to 87 locally and 94
on the recorded Vercel run. The largest cause was reducing the hero-image
payload, with image dimensions helping layout stability. These are Day 43–45
measurements, not a fresh run on today's checkout, and the menu bundle was
still 171–173 kB, above the old 120 kB target.”

Do not call those numbers current unless Lighthouse is rerun against the exact
commit and URL being presented.

## Reproduce a current measurement

1. Build and serve a production build (`npm run build`, then `npm run start`).
2. Use Chrome Incognito and Lighthouse Mobile with the same throttling settings
   for each run.
3. Record at least three runs for LCP and report the median. Keep URL,
   commit, date, Lighthouse version, device profile, and network/CPU throttling
   with the results.
4. Repeat against the exact deployed URL and commit. Do not compare a local
   run to a deployment without stating the conditions.

No current Lighthouse run is claimed in this document. Deployment and live
post-deployment verification must be completed separately; see
[README.md](./README.md).

The current source image files and generated Next.js variants have not been
re-benchmarked as part of these code changes. Verify the impact with the
production-build procedure above; image-priority and `sizes` changes are
intended optimizations, not a measured LCP result.
