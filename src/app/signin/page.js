import SignInForm from "@/components/SignInForm";

const DEMO_ACCOUNTS = [
  { phone: "0912345678", password: "password123", label: "Almaz", role: "customer" },
  { phone: "0922334455", password: "password123", label: "Biruk", role: "customer" },
  { phone: "0900000000", password: "staffpass", label: "Kitchen Staff", role: "staff" },
];

export const metadata = {
  title: "Sign in",
  description: "Sign in to Addis Eats to check out and follow your orders.",
};

export default async function SignInPage({ searchParams }) {
  const params = await searchParams;
  const next = typeof params?.next === "string" ? params.next : "/";
  const errorMessages = {
    google_not_configured: "Google sign-in is not configured yet. Use a demo account or ask the site administrator to configure it.",
    google_failed: "Google sign-in could not be completed. Please try again or use a demo account.",
  };
  const errorMessage = errorMessages[params?.error];

  return (
    <section className="mx-auto max-w-sm">
      <h1 className="mb-5 text-2xl font-bold">Sign in</h1>
      {errorMessage && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-800">
          {errorMessage}
        </p>
      )}
      <a
        href={`/signin/google?next=${encodeURIComponent(next)}`}
        className="mb-4 flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-stone-300 bg-white px-4 py-3 font-semibold text-stone-800 shadow-sm transition hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
      >
        <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
          <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z" />
          <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z" />
          <path fill="#FBBC05" d="M12.6 27.5a12 12 0 0 1 0-7v-5.3H5.8a20 20 0 0 0 0 17.6l6.8-5.3Z" />
          <path fill="#EA4335" d="M24 12.1c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6.1 29.5 4 24 4A20 20 0 0 0 5.8 15.2l6.8 5.3c1.6-4.8 6.1-8.4 11.4-8.4Z" />
        </svg>
        Continue with Google
      </a>
      <p className="mb-4 text-center text-sm text-stone-500">or sign in with a demo account</p>
      <SignInForm next={next} demoAccounts={DEMO_ACCOUNTS} />
    </section>
  );
}