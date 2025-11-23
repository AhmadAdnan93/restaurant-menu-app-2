import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockRestaurants, getMockRestaurants } from "@/lib/mock-data";

export async function GET() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        categories: {
          include: {
            menuItems: {
              include: {
                ratings: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    // Format to match expected structure
    const formatted = restaurants.map(({ categories, ...rest }) => ({
      ...rest,
      _count: {
        categories: categories.length,
      },
    }));
    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Database error, using mock data:", error);
    // Return mock data as fallback
    return NextResponse.json(getMockRestaurants());
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, logo, description } = body;

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        slug,
        logo,
        description,
      },
    });

    return NextResponse.json(restaurant, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create restaurant" },
      { status: 500 }
    );
  }
}

