import { notFound, redirect } from "next/navigation";
import OrderLive from "@/components/OrderLive";
import { getOwnedOrder, getOwnedTracking } from "@/lib/orders";
import { getSession } from "@/lib/session";

export const metadata = {
  title: "Order status",
  description: "Follow the status of your Addis Eats order.",
};
export default async function OrderPage({ params }) {
  const { id } = await params;

  const session = await getSession();
  if (!session) {
    redirect(`/signin?next=/orders/${id}`);
  }

  const result = getOwnedOrder(id, session.id);
  if (!result.ok) {
    notFound();
  }
       const trackingResult = getOwnedTracking(id, session.id);
     if (!trackingResult.ok) {
       notFound();
     }

  return (
    <section>
      <h1 className="mb-5 text-2xl font-bold">Order status</h1>
                        <OrderLive
           id={id}
           initialTracking={trackingResult.tracking}
           initialOrder={result.order}
         />
    </section>
  );
}