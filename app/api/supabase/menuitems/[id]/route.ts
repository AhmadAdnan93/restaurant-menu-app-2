import { NextRequest, NextResponse } from "next/server";
import { getSupabase, useSupabase } from "@/lib/supabase/server";

async function checkAuth(supabase: ReturnType<typeof getSupabase>, token: string, menuItemId?: string) {
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return { ok: false, status: 401 };
  const { data: roleRow } = await supabase.from("user_roles").select("role, restaurant_id").eq("user_id", user.id).single();
  if (roleRow?.role !== "SUPER_ADMIN" && roleRow?.role !== "RESTAURANT_OWNER") return { ok: false, status: 403 };
  if (menuItemId && roleRow?.role === "RESTAURANT_OWNER" && roleRow?.restaurant_id) {
    const { data: item } = await supabase.from("menu_items").select("category_id").eq("id", menuItemId).single();
    if (item) {
      const { data: cat } = await supabase.from("categories").select("restaurant_id").eq("id", item.category_id).single();
      if (cat?.restaurant_id !== roleRow.restaurant_id) return { ok: false, status: 403 };
    }
  }
  return { ok: true };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!useSupabase()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const supabase = getSupabase();
    const { id } = await params;
    const auth = await checkAuth(supabase, token, id);
    if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

    const body = await request.json();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.name != null) updates.name = body.name;
    if (body.description != null) updates.description = body.description;
    if (body.price != null) updates.price = body.price;
    if (body.image !== undefined) updates.image = body.image;
    if (body.order != null) updates.order = body.order;
    if (body.isAvailable !== undefined) updates.is_available = body.isAvailable;

    const { data, error } = await supabase.from("menu_items").update(updates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const { data: ratings } = await supabase.from("ratings").select("value").eq("menu_item_id", id);
    const avg = ratings?.length ? ratings.reduce((a: number, r: any) => a + (r.value || 0), 0) / ratings.length : 0;

    return NextResponse.json({
      id: data.id,
      name: data.name,
      description: data.description,
      price: parseFloat(String(data.price)),
      image: data.image,
      order: data.order,
      isAvailable: data.is_available,
      averageRating: avg,
      ratingCount: ratings?.length || 0,
    });
  } catch (err: any) {
    console.error("MenuItem PUT error:", err);
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!useSupabase()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const supabase = getSupabase();
    const { id } = await params;
    const auth = await checkAuth(supabase, token, id);
    if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    console.error("MenuItem DELETE error:", err);
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
