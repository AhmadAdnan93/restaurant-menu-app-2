import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to check if a string is a UUID (restaurant ID)
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // If it's a UUID, treat it as an ID and fetch by ID
    if (isUUID(slug)) {
      const response = await fetch(`${API_BASE_URL}/restaurants/${slug}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.json(
            { error: "Restaurant not found" },
            { status: 404 }
          );
        }
        throw new Error(`Backend responded with ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    }
    
    // Otherwise, treat it as a slug
    // Clean slug - remove any leading slashes or /menu/ prefix
    const cleanSlug = slug.replace(/^\/menu\//, '').replace(/^\//, '');
    
    const response = await fetch(`${API_BASE_URL}/restaurants/slug/${cleanSlug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Restaurant not found" },
          { status: 404 }
        );
      }
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurant" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    console.log('DELETE route called for restaurant');
    const { slug } = await params;
    console.log('Restaurant identifier:', slug);
    
    // For DELETE, we expect an ID (UUID), not a slug
    if (!isUUID(slug)) {
      return NextResponse.json(
        { error: "Invalid restaurant ID format" },
        { status: 400 }
      );
    }
    
    const id = slug;
    
    if (!id) {
      return NextResponse.json(
        { error: "Restaurant ID is required" },
        { status: 400 }
      );
    }
    
    // Get auth token from cookies or headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth_token')?.value;
    
    console.log('Token present:', !!token);
    
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log('Forwarding DELETE request to backend:', `${API_BASE_URL}/restaurants/${id}`);
    console.log('Token length:', token.length);
    console.log('Token preview:', token.substring(0, 20) + '...');

    const response = await fetch(`${API_BASE_URL}/restaurants/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Backend response status:', response.status);
    console.log('Backend response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to delete restaurant' }));
      console.log('Backend error data:', errorData);
      return NextResponse.json(
        { error: errorData.message || errorData.error || "Failed to delete restaurant" },
        { status: response.status }
      );
    }

    // DELETE returns 204 No Content
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    return NextResponse.json(
      { error: "Failed to delete restaurant" },
      { status: 500 }
    );
  }
}

