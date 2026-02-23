import { NextRequest, NextResponse } from "next/server";
import { getSupabase, useSupabase } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
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
    if (roleRow?.role !== "SUPER_ADMIN" && roleRow?.role !== "RESTAURANT_OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { categoryId } = await params;
    const { data: cat } = await supabase.from("categories").select("restaurant_id").eq("id", categoryId).single();
    if (!cat) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    if (roleRow?.role === "RESTAURANT_OWNER" && roleRow?.restaurant_id && roleRow.restaurant_id !== cat.restaurant_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        category_id: categoryId,
        name: body.name,
        description: body.description,
        price: parseFloat(String(body.price)) || 0,
        image: body.image || null,
        order: body.order ?? 0,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({
      id: data.id,
      name: data.name,
      description: data.description,
      price: parseFloat(String(data.price)),
      image: data.image,
      order: data.order,
      isAvailable: data.is_available,
      averageRating: 0,
      ratingCount: 0,
    }, { status: 201 });
  } catch (err: any) {
    console.error("MenuItem POST error:", err);
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
