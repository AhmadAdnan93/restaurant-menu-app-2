import { NextRequest, NextResponse } from "next/server";
import { getSupabase, useSupabase } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!useSupabase()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const { id } = await params;
    const supabase = getSupabase();

    const { data: restaurant, error: rErr } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", id)
      .single();

    if (rErr || !restaurant) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: categories } = await supabase
      .from("categories")
      .select("*")
      .eq("restaurant_id", id)
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

    const res = {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      logo: restaurant.logo,
      coverImage: restaurant.cover_image,
      description: restaurant.description,
      isPublished: restaurant.is_published,
      qrCode: restaurant.qr_code,
      categories: categoriesWithItems,
    };
    return NextResponse.json(res);
  } catch (err: any) {
    console.error("Restaurant GET by id error:", err);
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const role = roleRow?.role;
    if (role !== "SUPER_ADMIN" && role !== "RESTAURANT_OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (role === "RESTAURANT_OWNER" && roleRow?.restaurant_id) {
      const { id } = await params;
      if (roleRow.restaurant_id !== id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const { id } = await params;
    const body = await request.json();
    const slug = body.slug != null ? String(body.slug).trim().replace(/^\/menu\//, "").replace(/^\//, "").replace(/\/$/, "") : undefined;

    const updates: Record<string, unknown> = {};
    if (body.name != null) updates.name = body.name;
    if (slug != null) updates.slug = slug;
    if (body.logo !== undefined) updates.logo = body.logo;
    if (body.coverImage !== undefined) updates.cover_image = body.coverImage;
    if (body.description !== undefined) updates.description = body.description;
    if (body.isPublished !== undefined) updates.is_published = body.isPublished;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("restaurants")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({
      id: data.id,
      name: data.name,
      slug: data.slug,
      logo: data.logo,
      coverImage: data.cover_image,
      description: data.description,
      isPublished: data.is_published,
      qrCode: data.qr_code,
      createdAt: data.created_at,
    });
  } catch (err: any) {
    console.error("Restaurant PUT error:", err);
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { data: roleRow } = await supabase.from("user_roles").select("role, restaurant_id").eq("user_id", user.id).single();
    const role = roleRow?.role;
    if (role !== "SUPER_ADMIN" && role !== "RESTAURANT_OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    if (role === "RESTAURANT_OWNER" && roleRow?.restaurant_id && roleRow.restaurant_id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase.from("restaurants").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    console.error("Restaurant DELETE error:", err);
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
