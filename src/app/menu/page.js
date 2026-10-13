import CategoryBar from "@/components/CategoryBar";
import { getCategories, getDishes, PAGE_SIZE } from "@/lib/dishes";

export const metadata = {
  title: "Menu",
  description:
    "Doro Wat, Kitfo, Tibs, Shiro and more. Browse the Addis Eats menu and order Ethiopian food online, with all prices in ETB.",
  alternates: { canonical: "/menu" },
};

// ISR: dishes change a few times a day, so an hour of staleness is fine.
export const revalidate = 3600;

export default async function MenuPage() {
  const [dishes, categories] = await Promise.all([getDishes(), getCategories()]);

  // Page 1, category "All", no search: the one key CategoryBar can
  // render immediately, with no network request, via fallbackData.
  const initialPage = {
    dishes: dishes.slice(0, PAGE_SIZE),
    page: 1,
    pageSize: PAGE_SIZE,
    total: dishes.length,
    totalPages: Math.max(1, Math.ceil(dishes.length / PAGE_SIZE)),
  };

  return (
    <section>
      <h1 className="mb-5 text-2xl font-bold">Menu</h1>
      <CategoryBar categories={categories} initialPage={initialPage} />
    </section>
  );
}