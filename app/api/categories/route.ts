import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').trim().replace(/\s/g, '').replace(/\/$/, '') || 'http://localhost:5000/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId, ...categoryData } = body;
    
    // Get auth token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = `${API_BASE_URL}/categories/restaurant/${restaurantId}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
        signal: controller.signal,
      });
    } catch (err: any) {
      clearTimeout(timeout);
      if (err?.name === 'AbortError') {
        return NextResponse.json({ error: 'Backend took too long. Try again.' }, { status: 504 });
      }
      throw err;
    }
    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to create category' }));
      return NextResponse.json(
        { error: errorData.message || "Failed to create category" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

