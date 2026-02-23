import { getSupabase, useSupabase } from "@/lib/supabase/server";

export interface MenuRestaurant {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  coverImage: string | null;
  description: string | null;
  categories: Array<{
    id: string;
    name: string;
    description: string | null;
    order: number;
    menuItems: Array<{
      id: string;
      name: string;
      description: string;
      price: number;
      image: string | null;
      order: number;
      averageRating: number;
      ratingCount: number;
    }>;
  }>;
}

export async function getRestaurantBySlug(slug: string): Promise<MenuRestaurant | null> {
  if (!useSupabase()) return null;
  const cleanSlug = (slug || "").trim().toLowerCase();
  if (!cleanSlug) return null;

  const supabase = getSupabase();

  const { data: restaurant, error: rErr } = await supabase
    .from("restaurants")
    .select("*")
    .ilike("slug", cleanSlug)
    .eq("is_published", true)
    .limit(1)
    .maybeSingle();

  if (rErr || !restaurant) return null;

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .eq("is_active", true)
    .order("order", { ascending: true });

  const cats = categories || [];
  const categoriesWithItems = await Promise.all(
    cats.map(async (cat) => {
      const { data: items } = await supabase
        .from("menu_items")
        .select("*")
        .eq("category_id", cat.id)
        .eq("is_available", true)
        .order("order", { ascending: true });

      const menuItems = await Promise.all(
        (items || []).map(async (m) => {
          const { data: ratings } = await supabase
            .from("ratings")
            .select("value")
            .eq("menu_item_id", m.id);
          const avg =
            ratings?.length
              ? ratings.reduce((a: number, r: any) => a + (r.value || 0), 0) / ratings.length
              : 0;
          return {
            id: m.id,
            name: m.name,
            description: m.description ?? "",
            price: parseFloat(String(m.price)),
            image: m.image,
            order: m.order,
            averageRating: avg,
            ratingCount: ratings?.length || 0,
          };
        })
      );
      return {
        id: cat.id,
        name: cat.name,
        description: cat.description,
        order: cat.order,
        menuItems,
      };
    })
  );

  return {
    id: restaurant.id,
    name: restaurant.name,
    slug: restaurant.slug,
    logo: restaurant.logo,
    coverImage: restaurant.cover_image,
    description: restaurant.description,
    categories: categoriesWithItems,
  };
}
