import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, params, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, params, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, params, "PUT");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, params, "DELETE");
}

async function proxy(
  request: NextRequest,
  params: Promise<{ path: string[] }>,
  method: string
) {
  const raw = (BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").trim().replace(/\s/g, "");
  const base = raw.replace(/\/$/, "");
  const isProduction = process.env.VERCEL === "1";
  if (isProduction && (!base || base.includes("localhost") || base.includes("127.0.0.1"))) {
    return NextResponse.json(
      {
        message:
          "Backend not configured. Add BACKEND_API_URL in Vercel to your Railway URL + /api. Run: .\\FIX_NOW.ps1 \"https://your-railway-url.up.railway.app\"",
      },
      { status: 503 }
    );
  }
  const effectiveUrl = base;

  const { path } = await params;
  const pathStr = path.join("/");
  const url = `${effectiveUrl}/${pathStr}`;
  const search = request.nextUrl.searchParams.toString();
  const fullUrl = search ? `${url}?${search}` : url;

  try {
    const headers: Record<string, string> = {};
    request.headers.forEach((v, k) => {
      if (
        k.toLowerCase() !== "host" &&
        k.toLowerCase() !== "connection"
      ) {
        headers[k] = v;
      }
    });

    // Use arrayBuffer for body to preserve binary data (multipart/form-data for image uploads)
    const body = method !== "GET" ? await request.arrayBuffer() : undefined;
    const controller = new AbortController();
    const isUpload = pathStr.includes("upload");
    const timeoutMs = isUpload ? 60000 : 25000; // 60s for uploads, 25s for others
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let res: Response;
    try {
      res = await fetch(fullUrl, { method, headers, body, signal: controller.signal });
    } catch (err: any) {
      clearTimeout(timeout);
      if (err?.name === "AbortError") {
        console.error("Backend timeout:", fullUrl);
        return NextResponse.json(
          { message: "Backend took too long to respond. Try again." },
          { status: 504 }
        );
      }
      throw err;
    }
    clearTimeout(timeout);
    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    console.error("Backend proxy error:", error);
    return NextResponse.json(
      { message: "Backend unavailable. Check BACKEND_API_URL." },
      { status: 502 }
    );
  }
}
