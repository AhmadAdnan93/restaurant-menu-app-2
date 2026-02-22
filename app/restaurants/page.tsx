import Link from "next/link";
import Image from "next/image";
import { ensureAbsoluteImageUrl } from "@/lib/image-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";
import { restaurantsApi } from "@/lib/api-client";
import { getMockRestaurants } from "@/lib/mock-data";

async function getRestaurants() {
  try {
    return await restaurantsApi.getAll(true);
  } catch (error) {
    console.error("API error, using mock data:", error);
    return getMockRestaurants();
  }
}

export default async function RestaurantsPage() {
  const restaurants = await getRestaurants();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Our Restaurants</h1>
            <Button asChild variant="outline">
              <Link href="/">Home</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {restaurants.length === 0 ? (
          <div className="text-center py-12">
            <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No restaurants available
            </h3>
            <p className="text-gray-500">
              Check back later for available restaurants.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    {restaurant.logo && (
                      <div className="relative w-12 h-12">
                        <Image
                          src={ensureAbsoluteImageUrl(restaurant.logo)}
                          alt={restaurant.name}
                          fill
                          className="object-contain rounded-lg"
                        />
                      </div>
                    )}
                    <CardTitle className="text-xl">{restaurant.name}</CardTitle>
                  </div>
                  {restaurant.description && (
                    <CardDescription>{restaurant.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={`/menu/${restaurant.slug}`}>View Menu</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

