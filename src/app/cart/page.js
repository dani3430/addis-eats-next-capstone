import CartView from "@/components/CartView";
export const metadata = {
  title: "Your cart",
  description: "Review the dishes in your cart before you check out at Addis Eats.",
};

export default function CartPage() {
  return (
    <section>
      <h1 className="mb-5 text-2xl font-bold">Your cart</h1>
      <CartView />
    </section>
  );
}