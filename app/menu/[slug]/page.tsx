import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getRestaurantBySlug } from "@/lib/supabase/menu";
import { MenuContent } from "@/components/MenuContent";

// Always fetch fresh menu data when admin adds/edits items
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Get the base URL for QR codes - use current request host so it works on any deployment URL */
async function getMenuBaseUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const baseFromHost = `${proto}://${host}`.replace(/\/$/, "");

  // If on production (not localhost), always use request host so QR points to current domain
  // This fixes: resturent-app-taupe.vercel.app vs restaurant-menu-app.vercel.app
  if (!host.includes("localhost") && !host.includes("127.0.0.1")) {
    return baseFromHost;
  }

  // Local dev: use env or host
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL;
  if (appUrl) return appUrl.replace(/\/$/, "");
  return baseFromHost;
}

async function getRestaurant(slug: string) {
  // Clean slug - remove any leading slashes or /menu/ prefix
  let cleanSlug = (slug || "").trim();
  while (cleanSlug.startsWith("/menu/") || cleanSlug.startsWith("menu/")) {
    cleanSlug = cleanSlug.replace(/^\/?menu\//, "");
  }
  cleanSlug = cleanSlug.replace(/^\/+/, "").replace(/\/+$/, "");

  const restaurant = await getRestaurantBySlug(cleanSlug);
  if (restaurant) return restaurant;

  return null;
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);

  if (!restaurant) {
    notFound();
  }

  const baseUrl = await getMenuBaseUrl();
  const menuUrl = `${baseUrl}/menu/${restaurant.slug}`;

  return <MenuContent restaurant={restaurant} menuUrl={menuUrl} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);

  if (!restaurant) {
    return {
      title: "Restaurant Not Found",
    };
  }

  return {
    title: `${restaurant.name} - Menu`,
    description: restaurant.description || `Menu for ${restaurant.name}`,
  };
}

