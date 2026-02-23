import { NextResponse } from "next/server";

const BACKEND =
  process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  try {
    const base = String(BACKEND).trim().replace(/\/$/, "");
    if (!base || base.includes("localhost")) {
      return NextResponse.json({ ok: true, message: "No backend to warm" });
    }
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 25000);
    await fetch(`${base}/restaurants?publishedOnly=true`, {
      signal: controller.signal,
    });
    clearTimeout(t);
  } catch {
    // Ignore - warm-up best effort
  }
  return NextResponse.json({ ok: true });
}
