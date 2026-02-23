import { NextRequest, NextResponse } from "next/server";
import { getSupabase, useSupabase } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (!useSupabase()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, role = "CUSTOMER" } = body;
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data: authData, error } = await supabase.auth.signUp({
      email: String(email).trim(),
      password,
      options: { data: { display_name: firstName || lastName ? `${firstName || ""} ${lastName || ""}`.trim() : undefined } },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!authData.user) {
      return NextResponse.json({ error: "Registration failed" }, { status: 500 });
    }

    await supabase.from("user_roles").insert({
      user_id: authData.user.id,
      role: ["SUPER_ADMIN", "RESTAURANT_OWNER", "CUSTOMER"].includes(role) ? role : "CUSTOMER",
    });

    const token = authData.session?.access_token;
    return NextResponse.json({
      token: token || "",
      userId: authData.user.id,
      email: authData.user.email || "",
      role: role || "CUSTOMER",
    });
  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json({ error: err.message || "Registration failed" }, { status: 500 });
  }
}
