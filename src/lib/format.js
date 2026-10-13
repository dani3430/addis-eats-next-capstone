// One shared module for every price and time on the site.
// Each formatter is built once, here, because creating one is the expensive part.
// The locale and the time zone are always named, so the server and the phone agree.

const money = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  maximumFractionDigits: 0,
});

// "en-GB" gives day-month order and a 24-hour clock ("14 Jul 2026, 18:40").
// "en-ET" has no date rules of its own and falls back to US-style English.
const dateTime = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Addis_Ababa", // EAT, UTC+3, no daylight saving
});
const dateOnly = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "Africa/Addis_Ababa",
});
const timeOnly = new Intl.DateTimeFormat("en-GB", {
  timeStyle: "short",
  timeZone: "Africa/Addis_Ababa",
});
const relativeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

// Money: etb(14200) -> "ETB 14,200"
export const etb = (value) => money.format(value);

// Dates and times in Addis Ababa time, from an ISO string (stored in UTC) or a Date.
export const when = (value) => dateTime.format(new Date(value)); // 14 Jul 2026, 18:40
export const day = (value) => dateOnly.format(new Date(value)); // 14 Jul 2026
export const clock = (value) => timeOnly.format(new Date(value)); // 18:40

// Relative time: relative(iso) -> "12 minutes ago", "in 5 minutes", "now".
// It depends on the current moment, so use it only in client components, after mount.
export function relative(value, now = Date.now()) {
  const seconds = Math.round((new Date(value).getTime() - now) / 1000);
  const size = Math.abs(seconds);

  if (size < 45) return relativeFormat.format(0, "second");
  if (size < 3600) return relativeFormat.format(Math.round(seconds / 60), "minute");
  if (size < 86400) return relativeFormat.format(Math.round(seconds / 3600), "hour");
  return relativeFormat.format(Math.round(seconds / 86400), "day");
}