import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMockRestaurantBySlug } from "@/lib/mock-data";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: params.slug },
      include: {
        categories: {
          include: {
            menuItems: {
              include: {
                ratings: true,
              },
              orderBy: {
                order: "asc",
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!restaurant) {
      // Try mock data
      const mockRestaurant = getMockRestaurantBySlug(params.slug);
      if (mockRestaurant) {
        return NextResponse.json(mockRestaurant);
      }
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("Database error, using mock data:", error);
    // Try mock data as fallback
    const mockRestaurant = getMockRestaurantBySlug(params.slug);
    if (mockRestaurant) {
      return NextResponse.json(mockRestaurant);
    }
    return NextResponse.json(
      { error: "Failed to fetch restaurant" },
      { status: 500 }
    );
  }
}

