export default function MenuLayout({ children }) {
  return (
    <div>
      <p className="mb-4 rounded-lg bg-amber-100 px-4 py-2 text-sm text-amber-900">
        Freshly prepared daily · all prices in ETB
      </p>
      {children}
    </div>
  );
}