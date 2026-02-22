// Fast load: cache restaurants for instant display (< 2 sec rule)

const CACHE_KEY = "admin_restaurants_v1";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

export interface CachedRestaurant {
  id: string;
  name: string;
  slug: string;
  categoryCount?: number;
  _count?: { categories: number };
  [key: string]: unknown;
}

export function getCachedRestaurants(): CachedRestaurant[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

export function setCachedRestaurants(data: CachedRestaurant[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    /* ignore */
  }
}
