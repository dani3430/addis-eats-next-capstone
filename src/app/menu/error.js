"use client";

export default function MenuError({ error, reset }) {
  return (
    <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-6">
      <h2 className="text-lg font-bold text-red-800">We couldn&apos;t load the menu</h2>
      <p className="mt-1 text-sm text-red-700">
        Something went wrong on our side. Your cart is safe.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-4 rounded bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
      >
        Try again
      </button>
    </div>
  );
}