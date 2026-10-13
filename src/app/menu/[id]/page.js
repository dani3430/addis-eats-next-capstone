import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import FavoriteButton from "@/components/FavoriteButton";
import { getDish, getDishes } from "@/lib/dishes";
import { etb } from "@/lib/format";

// The ids are known ahead of time, so every dish page is built at build time.
export async function generateStaticParams() {
  const dishes = await getDishes();
  return dishes.map((dish) => ({ id: dish.id }));
}
export async function generateMetadata({ params }) {
  const { id } = await params;
  const dish = await getDish(id);

  if (!dish) {
    return { title: "Dish not found" };
  }

  const description = `${dish.name} — ${dish.description} ${etb(dish.price)}.`;
  return {
    title: dish.name,
    description,
    openGraph: {
      title: `${dish.name} · Addis Eats`,
      description,
      url: `/menu/${dish.id}`,
      siteName: "Addis Eats",
      locale: "en_ET",
      type: "website",
      images: [{ url: dish.image, alt: `Plate of ${dish.name}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${dish.name} · Addis Eats`,
      description,
      images: [dish.image],
    },
  };
}
export default async function DishPage({ params }) {
  const { id } = await params;
  const dish = await getDish(id);

  if (!dish) {
    notFound();
  }
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: dish.name,
    description: dish.description,
    offers: {
      "@type": "Offer",
      price: dish.price,
      priceCurrency: "ETB",
    },
  };
  return (
    <div>
            <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Link
        href="/menu"
        className="mb-5 inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
      >
        <span aria-hidden="true">←</span> Back to menu
      </Link>

      <article className="grid overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm md:grid-cols-2">
        <Image
  src={dish.image}
  alt={`Plate of ${dish.name}`}
  width={800}
  height={600}
  sizes="(min-width: 1024px) 496px, (min-width: 768px) calc((100vw - 2rem) / 2), calc(100vw - 2rem)"
  priority
  className="h-64 w-full object-cover md:h-full"
/>
        <div className="flex flex-col justify-center p-6 md:p-8">
          <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
            {dish.category}
          </span>
          <h1 className="mt-3 text-3xl font-bold">{dish.name}</h1>
          <p className="mt-3 text-stone-600">{dish.description}</p>
          <p className="mt-5 text-3xl font-bold text-amber-700">{etb(dish.price)}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <AddToCartButton dish={{ id: dish.id, name: dish.name, price: dish.price }} />
            <FavoriteButton
              dishId={dish.id}
              dishName={dish.name}
              className="h-12 w-12"
            />
          </div>
        </div>
      </article>
    </div>
  );
}