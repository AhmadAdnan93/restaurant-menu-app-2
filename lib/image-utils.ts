/**
 * Ensures image URLs are absolute so they load correctly.
 * Backend may return URLs without protocol (e.g. "railway.app/uploads/x") which
 * browsers treat as relative paths, causing 404s on the frontend domain.
 */
export function ensureAbsoluteImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string") return "";
  const u = url.trim();
  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("//")) return "https:" + u;
  if (u.startsWith("data:")) return u;
  // Backend BaseUrl without protocol - prepend https for production
  if (u.includes("railway.app") || /^[a-z0-9.-]+\.up\.railway\.app/i.test(u)) {
    return "https://" + u.replace(/^\/+/, "");
  }
  if (u.includes("localhost")) return "http://" + u.replace(/^\/+/, "");
  return "https://" + u.replace(/^\/+/, "");
}
