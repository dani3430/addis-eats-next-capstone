"use client";

import { useActionState } from "react";
import { useRef } from "react";
import { signIn } from "@/app/signin/actions";

const initialState = { ok: false, message: "", values: { phone: "" } };

export default function SignInForm({ next, demoAccounts }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const phoneInput = useRef(null);
  const passwordInput = useRef(null);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-amber-200 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="next" value={next} />

      {state.message && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-800">
          {state.message}
        </p>
      )}

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-stone-700">
          Phone number
        </label>
        <input
          id="phone"
          ref={phoneInput}
          name="phone"
          type="tel"
          autoComplete="username"
          defaultValue={state.values.phone}
          className="mt-1 w-full rounded-lg border border-amber-300 px-3 py-2.5"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-stone-700">
          Password
        </label>
        <input
          id="password"
          ref={passwordInput}
          name="password"
          type="password"
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-amber-300 px-3 py-2.5"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-amber-600 px-5 py-3 font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <fieldset className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <legend className="px-1 text-sm font-semibold text-stone-800">Demo accounts</legend>
        <p className="mb-3 text-sm text-stone-600">
          Choose an account to fill its matching phone number and password.
        </p>
        <div className="flex flex-wrap gap-2">
          {demoAccounts.map((account) => (
            <button
              key={account.phone}
              type="button"
              disabled={pending}
              onClick={() => {
                phoneInput.current.value = account.phone;
                passwordInput.current.value = account.password;
                phoneInput.current.focus();
              }}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-950 transition hover:bg-amber-100 disabled:opacity-60"
            >
              Use {account.label} ({account.role})
            </button>
          ))}
        </div>
      </fieldset>
    </form>
  );
}