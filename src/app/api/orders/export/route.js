import { getSession } from "@/lib/session";
import { getAllOrdersForUser } from "@/lib/orders";
import { toCsv } from "@/lib/csv";
import { when } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/tracking";

export const dynamic = "force-dynamic";

const COLUMNS = [
  { header: "Order", value: (order) => order.id },
  { header: "Placed (Addis Ababa time)", value: (order) => when(order.createdAt) },
  { header: "Neighbourhood", value: (order) => order.area },
  { header: "Address", value: (order) => order.address },
  { header: "Items", value: (order) => order.lines.map((line) => `${line.qty} x ${line.name}`).join("; ") },
  { header: "Status", value: (order) => STATUS_LABELS[order.status] ?? order.status },
  // A plain number, not "ETB 1,240": a spreadsheet can add it up.
  { header: "Total (ETB)", value: (order) => order.total },
];

export async function GET() {
  // The middleware does not cover /api, so this handler checks the session itself.
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  // Scoped to the session: only this person's orders, never an id taken from the request.
  const orders = getAllOrdersForUser(session.id);

  return new Response(toCsv(COLUMNS, orders), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="addis-eats-orders.csv"',
      "Cache-Control": "no-store",
    },
  });
}