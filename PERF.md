# Performance: evidence and trade-offs

## What the measurements say

The Day 43–45 readings are historical. They are not a benchmark of the current
checkout and not a guarantee for a new deployment. They should not be called
current unless Lighthouse is rerun against the exact commit and URL.

| Home-page measure      | Day 43 baseline | Day 45 local production | Day 45 Vercel |
| ---------------------- | --------------: | ----------------------: | ------------: |
| Lighthouse performance |              71 |                      87 |            94 |

The local menu JavaScript was above the then-used 120 kB target (171–173 kB).
LCP varied between runs; an earlier three-run median was 3.3 seconds. Treat
small differences as noise.

An October 13, 2026 result (score 74, FCP 0.9 s, LCP 3.5 s, TBT 680 ms, CLS
0.002, Speed Index 1.2 s) did not identify the audited route or LCP element, so
it is only a provisional baseline. Lighthouse warned that IndexedDB data may
affect the run; this app does not use IndexedDB, so repeat audits in Incognito.

An October 14, 2026 run audited the final checkout once on a local production
build and once on Vercel. The route, device profile and throttling were not
recorded, so treat the columns as a rough comparison.

| Measure                  | Local production build | Vercel |
| ------------------------ | ---------------------: | -----: |
| Lighthouse performance   |                     92 |     92 |
| First Contentful Paint   |                  0.8 s |  1.2 s |
| Largest Contentful Paint |                  2.6 s |  1.9 s |
| Total Blocking Time      |                 260 ms | 300 ms |
| Cumulative Layout Shift  |                  0.002 |  0.103 |
| Speed Index              |                  0.8 s |  2.5 s |

Vercel had the faster LCP but a slower FCP and Speed Index. Its layout shift of
0.103 is just above the 0.1 "good" threshold, and the cause has not been
investigated. Each figure is a single run, not a median.

## What improved the result

- **Hero image:** a 1600×1600 JPEG (about 293 KiB) became a 1200×1200 WebP
  (about 144 KiB), still eagerly loaded. This was the largest recorded LCP
  improvement. Locally the optimizer returned about 14% fewer bytes
  (119,868 vs 139,652); that is a size comparison, not an LCP measurement.
- **Layout:** images have explicit dimensions, and responsive `sizes` avoid
  requesting unnecessarily wide variants on small screens.
- **Fonts:** `next/font` serves the font locally, with no third-party request.
- **Rendering:** the home page and menu stay static where the data allows it,
  and the menu's first page is in the initial HTML. Only the first dish image is
  prioritized; later images are lazy-loaded.
- **Less JavaScript:** charts load only on staff pages, Google sign-in is a
  server-side redirect with no client SDK, and the account header uses a native
  fetch instead of SWR, which now stays on the menu only.

## Reproduce a current measurement

1. Run `npm run build`, then `npm run start`.
2. Use Chrome Incognito and Lighthouse Mobile with the same throttling each run.
3. Record at least three runs and report the median LCP, with the URL, commit,
   date, Lighthouse version, device profile and throttling.
4. Repeat on the exact deployed URL and commit. Never compare a local run with
   a deployment without stating the conditions.

The October 14 runs are single runs; no three-run median has been recorded.
Image-priority and `sizes` changes are intended optimizations, not measured LCP
results. Deployment and live verification are covered separately in
[README.md](./README.md).
