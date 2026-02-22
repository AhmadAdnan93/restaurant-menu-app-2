import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function POST(request: NextRequest) {
  try {
    // Get auth token from headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Convert File to Buffer for Node.js FormData
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create FormData using form-data-like structure
    const boundary = `----WebKitFormBoundary${Math.random().toString(36).substring(2)}`;
    const formDataBody = [
      `--${boundary}`,
      `Content-Disposition: form-data; name="file"; filename="${file.name}"`,
      `Content-Type: ${file.type || 'application/octet-stream'}`,
      '',
      buffer,
      `--${boundary}--`,
    ];

    const bodyBuffer = Buffer.concat(
      formDataBody.map((part) => 
        Buffer.isBuffer(part) ? part : Buffer.from(part + '\r\n')
      )
    );

    // Forward the request to the backend
    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: bodyBuffer,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      console.error("Upload error:", errorData);
      return NextResponse.json(
        { error: errorData.message || errorData.error || "Upload failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}

