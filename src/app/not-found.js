import Link from "next/link";

export default function NotFound() {
  return (
    <section className="py-16 text-center">
      <h1 className="text-3xl font-bold">Not found</h1>
      <p className="mt-2 text-stone-600">We could not find what you were looking for.</p>
      <Link href="/menu" className="mt-4 inline-block text-amber-700 underline">
        Back to the menu
      </Link>
    </section>
  );
}