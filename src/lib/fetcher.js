// Shared by every SWR hook in the app. Throws on non-OK responses,
// so SWR's `error` branch fires instead of silently returning bad data.
export async function fetcher(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    error.status = res.status;
    try {
      error.info = await res.json();
    } catch {
      // response had no JSON body
    }
    throw error;
  }
  return res.json();
}