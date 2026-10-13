import "./globals.css";
import Link from "next/link";
import Providers from "@/components/Providers";
import AccountStatus from "@/components/AccountStatus";
import CartBadge from "@/components/CartBadge";
import FavoritesBadge from "@/components/FavoritesBadge";
import { Inter } from "next/font/google";
import { SITE_URL } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s · Addis Eats",
    default: "Addis Eats — food delivery in Addis Ababa",
  },
  description:
    "Order Doro Wat, Kitfo, Tibs and Shiro online. Ethiopian food delivered fast across Addis Ababa.",
  openGraph: {
    siteName: "Addis Eats",
    locale: "en_ET",
    type: "website",
    title: "Addis Eats — food delivery in Addis Ababa",
    description:
      "Order Doro Wat, Kitfo, Tibs and Shiro online. Ethiopian food delivered fast across Addis Ababa.",
    images: [{ url: "/images/dishes/doro-wat.jpg", alt: "Doro Wat from Addis Eats" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/dishes/doro-wat.jpg"],
  },
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/orders", label: "Orders" },
  { href: "/cart", label: "Cart", Badge: CartBadge },
  { href: "/checkout", label: "Checkout" },
  { href: "/favorites", label: "Favorites", Badge: FavoritesBadge },
];

export default function RootLayout({ children }) {
  return (
   <html lang="en" className={inter.className}>
      <body className="flex min-h-screen flex-col bg-amber-50 text-stone-800">
                <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-amber-700 focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
          >
            Skip to main content
          </a>
          <header className="sticky top-0 z-10 border-b border-amber-200 bg-white/95 shadow-sm backdrop-blur">
            <nav
              aria-label="Main"
              className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2"
            >
              <Link href="/" className="text-xl font-extrabold tracking-tight text-amber-700">
                Addis Eats
              </Link>
              <ul className="site-nav-links order-3 flex w-full flex-nowrap items-center gap-1 overflow-x-auto text-sm font-medium sm:order-none sm:w-auto sm:flex-1 sm:justify-center">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="whitespace-nowrap rounded-lg px-3 py-2 text-stone-700 transition hover:bg-amber-600 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
                    >
                      {link.label}
                      {link.Badge && <link.Badge />}
                    </Link>
                  </li>
                ))}
              </ul>
              <AccountStatus />
            </nav>
          </header>

                    <main
            id="main"
            tabIndex={-1}
            className="mx-auto w-full max-w-5xl flex-1 px-4 py-8"
          >
            {children}
          </main>

          <footer className="border-t border-amber-200 bg-white">
            <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Link href="/" className="text-lg font-extrabold text-amber-800">
                  Addis Eats
                </Link>
                <p className="mt-2 max-w-xs text-sm leading-6 text-stone-600">
                  Ethiopian favorites, freshly prepared and delivered across Addis Ababa.
                </p>
              </div>
              <div>
                <h2 className="font-semibold text-stone-900">Visit us</h2>
                <address className="mt-2 text-sm not-italic leading-6 text-stone-600">
                  Bole<br />
                  Addis Ababa, Ethiopia
                </address>
                <a
                  href="https://maps.google.com/?q=Bole%2C+Addis+Ababa%2C+Ethiopia"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 text-sm font-medium text-amber-800 underline underline-offset-2"
                >
                  Find Bole on the map
                </a>
              </div>
              <div>
                <h2 className="font-semibold text-stone-900">Contact</h2>
                <a
                  href="tel:+251110000048"
                  className="mt-2 text-sm font-medium text-amber-800 underline underline-offset-2"
                >
                  +251 11 000 0048
                </a>
                <p className="mt-1 text-xs text-stone-500">Sample number for this demo</p>
                <p className="mt-3 text-sm text-stone-600">Daily, 10:00–22:00</p>
              </div>
              <div>
                <h2 className="font-semibold text-stone-900">Quick links</h2>
                <ul className="mt-2 space-y-1 text-sm text-stone-600">
                  <li><Link href="/menu" className="underline underline-offset-2">Menu</Link></li>
                  <li><Link href="/favorites" className="underline underline-offset-2">Favorites</Link></li>
                  <li><Link href="/cart" className="underline underline-offset-2">Your cart</Link></li>
                  <li><Link href="/orders" className="underline underline-offset-2">Track an order</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-amber-100 px-4 py-4 text-center text-xs text-stone-500">
              © 2026 Addis Eats. Demo project; sample contact details.
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}