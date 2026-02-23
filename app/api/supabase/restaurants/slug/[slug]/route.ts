import { NextRequest, NextResponse } from "next/server";
import { getSupabase, useSupabase } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!useSupabase()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const { slug } = await params;
    const supabase = getSupabase();

    const { data: restaurant, error: rErr } = await supabase
      .from("restaurants")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (rErr || !restaurant) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

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
            const avg = ratings?.length
              ? ratings.reduce((a: number, r: any) => a + (r.value || 0), 0) / ratings.length
              : 0;
            return {
              id: m.id,
              name: m.name,
              description: m.description,
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

    return NextResponse.json({
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      logo: restaurant.logo,
      coverImage: restaurant.cover_image,
      description: restaurant.description,
      isPublished: restaurant.is_published,
      qrCode: restaurant.qr_code,
      categories: categoriesWithItems,
    });
  } catch (err: any) {
    console.error("Restaurant GET by slug error:", err);
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
