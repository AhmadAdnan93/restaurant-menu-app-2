import { NextRequest, NextResponse } from "next/server";
import { getSupabase, useSupabase } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (!useSupabase()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const body = await request.json();
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email: String(email).trim(), password });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (!authData.session?.access_token || !authData.user) {
      return NextResponse.json({ error: "Login failed" }, { status: 401 });
    }

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role, restaurant_id")
      .eq("user_id", authData.user.id)
      .single();

    const role = roleRow?.role || "CUSTOMER";
    const restaurantId = roleRow?.restaurant_id || undefined;

    return NextResponse.json({
      token: authData.session.access_token,
      userId: authData.user.id,
      email: authData.user.email || "",
      role,
      restaurantId,
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({ error: err.message || "Login failed" }, { status: 500 });
  }
}
