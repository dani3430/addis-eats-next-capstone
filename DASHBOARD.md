# Staff reporting and kitchen queue

## What was built

| Where | What |
| --- | --- |
| `/dashboard` (staff only) | Revenue and order KPIs, revenue-by-neighbourhood bar chart and table, 14-day order-volume chart and table, plus all customer orders |
| `/kitchen` (staff only) | Current received/preparing order queue |
| Staff order actions | Cancel and retain an order in history; excluded from revenue and the active kitchen queue |
| Staff export | UTF-8 CSV with BOM, downloadable from the dashboard and directly openable in Excel |
| `/orders` (signed-in customer) | That customer's own sortable, paged order history |
| `src/lib/orders.js` | Server-side revenue aggregation, customer-scoped orders, and a staff-only field projection |
| `src/components/StaffOrderTable.js` | Shared accessible order detail table for dashboard and kitchen |

## Rules from the sheet, and how they are met

- **Staff access:** `/dashboard` and `/kitchen` verify a session and then require `role === "staff"` before loading customer order details.
- **Customer privacy:** `getOrdersForStaff()` explicitly selects the fields staff need. `publicOrder()` remains a separate projection without customer name, phone, or user id for customer-facing APIs.
- **Aggregation on the server:** KPIs and revenue aggregates are calculated on the server. Only aggregate chart rows are passed to the chart components; customer details are rendered by the protected server pages.
- **Order detail:** the staff table includes order ID, customer name and phone, ordered items and quantities, delivery neighbourhood/address, local order time (Africa/Addis_Ababa), status, and total. Cancelled orders are visibly marked and excluded from revenue.
- **Cancellation:** staff actions verify the session role on the server, confirm before submitting, disable while pending, and retain cancelled rows for the audit history.
- **Export:** `/api/staff/orders/export` is staff-only and exports all order/customer fields needed for reconciliation. CSV text is escaped against spreadsheet formula injection.
- **Mobile tables:** staff order rows render as readable cards on small screens; chart summary tables remain keyboard-focusable and horizontally scroll only when their columns require it.
- **Honest charts:** the bar chart's y-axis starts at zero (`domain={[0, "auto"]}`). Every chart has a heading naming the range and the unit (ETB, orders). Each chart has one scale. No pie chart is used.
- **Readable without colour:** the bars carry their amounts as labels, and the line has a dot for every day. Both charts are followed by the same numbers in a table.
- **Fixed heights:** the bar chart is 320 px high and the line chart 300 px, so nothing collapses or jumps.
- **ETB formatting:** one formatter (`src/lib/format.js`) is used by the axis, labels, tooltips and tables.
- **Real table markup:** tables use `table`, `caption`, `thead`, scoped headers, and tabular figures. The wide order table scrolls horizontally on narrow screens.
- **State in the URL:** `?sort=`, `?dir=` and `?page=` are read on the server. The sort name comes from a fixed list, so the URL can never choose an arbitrary field. An invalid page number falls back to the nearest real page. Each page number is a real `<Link>`.

## The four states of `/orders`

| State   | Written in          | Show it on demand                                      |
| ------- | ------------------- | ------------------------------------------------------ |
| Loading | `orders/loading.js` | `/orders?demo=slow`                                    |
| Empty   | `orders/page.js`    | `/orders?demo=empty`, or the staff account (no orders) |
| Error   | `orders/error.js`   | `/orders?demo=error`                                   |
| Loaded  | `OrderTable.js`     | `/orders`                                              |

## Check yourself

- **Does every bar chart axis start at zero?** Yes: `domain={[0, "auto"]}` in `RevenueChart.js`.
- **Can you read every chart with the colour removed?** Yes. The bars carry labels, the line has dots, and both have a table. Checked with the browser's achromatopsia emulation.
- **What order fields does staff see?** Name, phone, items, address, neighbourhood, timestamp, status, and total on staff-only pages. Never expose the staff projection through customer APIs.
- **Does the table survive being copied into a spreadsheet?** Yes: it is real table markup, and the pasted columns stayed in line.
- **Can you link someone directly to page three sorted by total?** Yes: `/orders?sort=total&dir=desc&page=3`.
- **What does a clear kitchen queue show?** A clear-queue message rather than an empty table.

## Fixed along the way

- **Cart badge:** the navbar now shows the number of items in the cart (`CartBadge.js`).
- **Navbar after sign-in:** it refreshes on every page change and clears at once on sign-out, so it no longer waits for a manual refresh (`AccountStatus.js`).
- **Cancelled orders:** they stay in the history, clearly marked (a ✕ badge, a grey row, a struck-through total), because a cancelled order still matters for records.

## Known limits

- **Demo data:** the dashboard numbers come from generated demo orders, and the page says so.
- **In-memory store:** orders are not saved to a database. A restart empties real orders, and on a serverless host an order may not survive between requests. The demo orders are rebuilt identically each time.
- **Kitchen statuses:** the demo journey derives status from order age. The queue includes received and preparing orders; this demo does not persist manual kitchen status changes.
- **Presentation delivery timing:** the simulated journey reaches delivered 90 seconds after order creation (received for 10 seconds, preparing until 30 seconds, then on the way). ETA and live map progress use the same timeline; this is not a real-world delivery estimate or GPS feed.
- **Days are counted in UTC,** while Addis Ababa is three hours ahead, so an evening order may be counted on the next day.
- **Cancelled orders are excluded** from revenue and the daily counts.
