import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { value, comment, menuItemId } = body;

    if (value < 1 || value > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const rating = await prisma.rating.create({
      data: {
        value,
        comment,
        menuItemId,
      },
    });

    return NextResponse.json(rating, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create rating" },
      { status: 500 }
    );
  }
}

