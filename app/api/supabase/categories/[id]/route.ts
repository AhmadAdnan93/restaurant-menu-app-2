import { NextRequest, NextResponse } from "next/server";
import { getSupabase, useSupabase } from "@/lib/supabase/server";

async function checkAuth(supabase: ReturnType<typeof getSupabase>, token: string, categoryId?: string) {
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return { ok: false, status: 401 };
  const { data: roleRow } = await supabase.from("user_roles").select("role, restaurant_id").eq("user_id", user.id).single();
  if (roleRow?.role !== "SUPER_ADMIN" && roleRow?.role !== "RESTAURANT_OWNER") return { ok: false, status: 403 };
  if (categoryId && roleRow?.role === "RESTAURANT_OWNER" && roleRow?.restaurant_id) {
    const { data: cat } = await supabase.from("categories").select("restaurant_id").eq("id", categoryId).single();
    if (cat?.restaurant_id !== roleRow.restaurant_id) return { ok: false, status: 403 };
  }
  return { ok: true, user };
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
    if (body.description !== undefined) updates.description = body.description;
    if (body.order != null) updates.order = body.order;
    if (body.isActive !== undefined) updates.is_active = body.isActive;

    const { data, error } = await supabase.from("categories").update(updates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const { count } = await supabase.from("menu_items").select("*", { count: "exact", head: true }).eq("category_id", id);
    return NextResponse.json({
      id: data.id,
      name: data.name,
      description: data.description,
      order: data.order,
      isActive: data.is_active,
      menuItemCount: count || 0,
      menuItems: [],
    });
  } catch (err: any) {
    console.error("Category PUT error:", err);
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!useSupabase()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  const token = _request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const supabase = getSupabase();
    const { id } = await params;
    const auth = await checkAuth(supabase, token, id);
    if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    console.error("Category DELETE error:", err);
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
