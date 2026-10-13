"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { signOut } from "@/app/signin/actions";

const linkClassName =
  "inline-flex min-h-11 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-amber-600 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800";

function subscribeToTheme(callback) {
  window.addEventListener("addis-eats-theme-change", callback);
  return () => window.removeEventListener("addis-eats-theme-change", callback);
}

function getThemeSnapshot() {
  return document.documentElement.dataset.theme === "dark";
}

function getServerThemeSnapshot() {
  return false;
}

function ThemeToggle() {
  const isDark = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  useEffect(() => {
    const savedTheme = localStorage.getItem("addis-eats-theme");
    document.documentElement.dataset.theme = savedTheme === "dark" ? "dark" : "light";
    window.dispatchEvent(new Event("addis-eats-theme-change"));
  }, []);

  function toggleTheme() {
    const nextTheme = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("addis-eats-theme", nextTheme);
    window.dispatchEvent(new Event("addis-eats-theme-change"));
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={isDark}
      className={`${linkClassName} border border-amber-200`}
    >
      {isDark ? "Light mode" : "Dark mode"}
    </button>
  );
}

export default function AccountStatus() {
  const [account, setAccount] = useState({ user: null, isLoading: true, error: false });
  const staffMenu = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAccount() {
      try {
        const response = await fetch("/api/session", { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Account request failed with status ${response.status}`);
        }
        const { user } = await response.json();
        setAccount({ user, isLoading: false, error: false });
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Unable to load account status", error);
        setAccount({ user: null, isLoading: false, error: true });
      }
    }

    loadAccount();
    return () => controller.abort();
  }, []);

  if (account.isLoading) {
    return (
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <span className="hidden px-2 py-2 text-sm text-stone-500 sm:inline">Account loading</span>
      </div>
    );
  }

  if (account.error) {
    return (
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <span role="status" className="hidden px-2 py-2 text-sm text-stone-600 sm:inline">
          Account unavailable
        </span>
      </div>
    );
  }

  if (!account.user) {
    return (
      <div className="ml-auto flex items-center gap-1">
        <Link href="/signin" className={linkClassName}>Sign in</Link>
        <ThemeToggle />
      </div>
    );
  }

  return (
    <div className="ml-auto flex shrink-0 items-center gap-1">
      {account.user.role === "staff" && (
        <details
          ref={staffMenu}
          onKeyDown={(event) => {
            if (event.key === "Escape" && staffMenu.current?.open) {
              event.preventDefault();
              staffMenu.current.open = false;
              staffMenu.current.querySelector("summary")?.focus();
            }
          }}
          className="group relative"
        >
          <summary className={`${linkClassName} cursor-pointer list-none gap-2`}>
            Staff
            <span aria-hidden="true" className="text-xs transition-transform group-open:rotate-180">
              ▼
            </span>
          </summary>
          <ul className="absolute left-0 right-auto top-full z-20 mt-2 w-48 rounded-xl border border-amber-200 bg-white p-2 shadow-lg sm:left-auto sm:right-0">
            <li>
              <Link href="/dashboard" className={`${linkClassName} w-full justify-start`}>
                Business overview
              </Link>
            </li>
            <li>
              <Link href="/kitchen" className={`${linkClassName} w-full justify-start`}>
                Kitchen queue
              </Link>
            </li>
          </ul>
        </details>
      )}
      <span className="hidden text-sm text-stone-600 lg:inline">
        Hi, {account.user.name.split(" ")[0]}
      </span>
      <form action={signOut}>
        <button
          type="submit"
          className={linkClassName}
        >
          Sign out
        </button>
      </form>
      <ThemeToggle />
    </div>
  );
}