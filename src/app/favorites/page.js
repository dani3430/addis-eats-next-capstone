import FavoriteDishes from "@/components/FavoriteDishes";
import { getDishes } from "@/lib/dishes";

export const metadata = {
  title: "Your favorites",
  description: "The dishes you saved from the Addis Eats menu.",
};

export default async function FavoritesPage() {
  const dishes = await getDishes();

  return (
    <section>
      <h1 className="mb-2 text-2xl font-bold">Your favorites</h1>
      <p className="mb-5 text-stone-600">
        Saved in this browser, ready whenever you are.
      </p>
      <FavoriteDishes dishes={dishes} />
    </section>
  );
}
