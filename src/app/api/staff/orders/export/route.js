import { getSession } from "@/lib/session";
import { getOrdersForStaff } from "@/lib/orders";
import { toCsv } from "@/lib/csv";
import { when } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/tracking";

export const dynamic = "force-dynamic";

const COLUMNS = [
  { header: "Order ID", value: (order) => order.id },
  { header: "Customer", value: (order) => order.name },
  { header: "Phone", value: (order) => order.phone },
  { header: "Placed (Addis Ababa time)", value: (order) => when(order.createdAt) },
  { header: "Status", value: (order) => STATUS_LABELS[order.status] ?? order.status },
  { header: "Neighbourhood", value: (order) => order.area },
  { header: "Delivery address", value: (order) => order.address },
  {
    header: "Items",
    value: (order) => order.lines.map((line) => `${line.qty} x ${line.name}`).join("; "),
  },
  { header: "Total (ETB)", value: (order) => order.total },
];

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }
  if (session.role !== "staff") {
    return Response.json({ error: "Staff access required" }, { status: 403 });
  }

  return new Response(toCsv(COLUMNS, getOrdersForStaff()), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="addis-eats-staff-orders.csv"',
      "Cache-Control": "no-store",
    },
  });
}
