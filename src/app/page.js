import Image from "next/image";
import Link from "next/link";
import DishList from "@/components/DishList";
import { getSpecials } from "@/lib/dishes";

// Static: everyone sees the same specials, and they change rarely.
export default async function HomePage() {
  const specials = await getSpecials();

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-xl">
        <Image
          src="/images/hero.webp"
          alt="Ethiopian food spread"
          width={1200}
          height={1200}
          sizes="(min-width: 1024px) 992px, calc(100vw - 2rem)"
          priority
          fetchPriority="high"
          className="h-64 w-full object-cover sm:h-80"
        />
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-6 text-white">
          <h1 className="text-3xl font-bold">Ethiopian food, ordered fast.</h1>
          <Link
            href="/menu"
            className="mt-3 w-fit rounded bg-amber-600 px-4 py-2 text-sm font-medium hover:bg-amber-700"
          >
            See the full menu
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Today&apos;s specials</h2>
            <p className="mt-1 text-stone-600">
              Ethiopian favorites, freshly prepared in Addis Ababa.
            </p>
          </div>
          <Link
            href="/menu"
            className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-white px-4 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
          >
            Browse all dishes <span aria-hidden="true" className="ml-2">→</span>
          </Link>
        </div>
        <DishList dishes={specials} />
      </section>
    </div>
  );
}