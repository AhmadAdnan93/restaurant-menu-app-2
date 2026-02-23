import { NextRequest, NextResponse } from "next/server";
import { getSupabase, useSupabase } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  if (!useSupabase()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const { restaurantId } = await params;
    const supabase = getSupabase();

    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id")
      .eq("id", restaurantId)
      .single();
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const { data: categories } = await supabase
      .from("categories")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("order", { ascending: true });

    const cats = categories || [];
    const withItems = await Promise.all(
      cats.map(async (cat) => {
        const { data: items } = await supabase
          .from("menu_items")
          .select("*")
          .eq("category_id", cat.id)
          .order("order", { ascending: true });
        return {
          id: cat.id,
          name: cat.name,
          description: cat.description,
          order: cat.order,
          isActive: cat.is_active,
          menuItemCount: (items || []).length,
          menuItems: (items || []).map((m) => ({
            id: m.id,
            name: m.name,
            description: m.description,
            price: parseFloat(String(m.price)),
            image: m.image,
            order: m.order,
            isAvailable: m.is_available,
            averageRating: 0,
            ratingCount: 0,
          })),
        };
      })
    );

    return NextResponse.json(withItems);
  } catch (err: any) {
    console.error("Categories GET error:", err);
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  if (!useSupabase()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const supabase = getSupabase();
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role, restaurant_id")
      .eq("user_id", user.id)
      .single();
    if (roleRow?.role !== "SUPER_ADMIN" && roleRow?.role !== "RESTAURANT_OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { restaurantId } = await params;
    if (roleRow?.role === "RESTAURANT_OWNER" && roleRow?.restaurant_id && roleRow.restaurant_id !== restaurantId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { data, error } = await supabase
      .from("categories")
      .insert({
        restaurant_id: restaurantId,
        name: body.name,
        description: body.description || null,
        order: body.order ?? 0,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({
      id: data.id,
      name: data.name,
      description: data.description,
      order: data.order,
      isActive: data.is_active,
      menuItemCount: 0,
      menuItems: [],
    }, { status: 201 });
  } catch (err: any) {
    console.error("Category POST error:", err);
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
