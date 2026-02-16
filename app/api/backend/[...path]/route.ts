import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

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
  const { path } = await params;
  const pathStr = path.join("/");
  const url = `${BACKEND_URL.replace(/\/$/, "")}/${pathStr}`;
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

    const body = method !== "GET" ? await request.text() : undefined;
    const res = await fetch(fullUrl, { method, headers, body });
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
