// Plain constants only — no Node-only imports — so middleware
// (which runs on the edge runtime) can safely import just this file.
export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days