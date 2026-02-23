import { NextRequest, NextResponse } from "next/server";
import { getSupabase, useSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  if (!useSupabase()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const { searchParams } = request.nextUrl;
    const publishedOnly = searchParams.get("publishedOnly") !== "false";
    const supabase = getSupabase();

    let query = supabase
      .from("restaurants")
      .select("id, name, slug, logo, cover_image, description, is_published, created_at, qr_code")
      .order("created_at", { ascending: false });

    if (publishedOnly) {
      query = query.eq("is_published", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase restaurants error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mapped = (data || []).map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      logo: r.logo,
      coverImage: r.cover_image,
      description: r.description,
      isPublished: r.is_published,
      createdAt: r.created_at,
      qrCode: r.qr_code,
      categoryCount: 0,
      _count: { categories: 0 },
    }));

    for (let i = 0; i < mapped.length; i++) {
      const { count } = await supabase
        .from("categories")
        .select("*", { count: "exact", head: true })
        .eq("restaurant_id", mapped[i].id);
      mapped[i].categoryCount = count || 0;
      mapped[i]._count = { categories: count || 0 };
    }

    return NextResponse.json(mapped);
  } catch (err: any) {
    console.error("Restaurants GET error:", err);
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!useSupabase()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const supabase = getSupabase();
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();
    const role = roleRow?.role;
    if (role !== "SUPER_ADMIN" && role !== "RESTAURANT_OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const slug = (body.slug || body.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "").trim();

    const { data, error } = await supabase
      .from("restaurants")
      .insert({
        name: body.name,
        slug,
        logo: body.logo || null,
        cover_image: body.coverImage ?? body.cover_image ?? null,
        description: body.description || null,
        is_published: body.isPublished ?? false,
      })
      .select()
      .single();

    if (error) {
      console.error("Restaurant create error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const res = {
      id: data.id,
      name: data.name,
      slug: data.slug,
      logo: data.logo,
      coverImage: data.cover_image,
      description: data.description,
      isPublished: data.is_published,
      qrCode: data.qr_code,
      createdAt: data.created_at,
      categoryCount: 0,
    };
    return NextResponse.json(res, { status: 201 });
  } catch (err: any) {
    console.error("Restaurant POST error:", err);
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
