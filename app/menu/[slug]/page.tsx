import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Image from "next/image";
import { ensureAbsoluteImageUrl } from "@/lib/image-utils";
import { ImageSlider } from "@/components/ImageSlider";
import { Rating } from "@/components/Rating";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCode } from "@/components/QRCode";
import { restaurantsApi } from "@/lib/api-client";
import { getMockRestaurantBySlug, type MockRestaurant } from "@/lib/mock-data";

/** Get the base URL for QR codes - use current request host so it works on any deployment URL */
async function getMenuBaseUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const baseFromHost = `${proto}://${host}`.replace(/\/$/, "");

  // If on production (not localhost), always use request host so QR points to current domain
  // This fixes: resturent-app-taupe.vercel.app vs restaurant-menu-app.vercel.app
  if (!host.includes("localhost") && !host.includes("127.0.0.1")) {
    return baseFromHost;
  }

  // Local dev: use env or host
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL;
  if (appUrl) return appUrl.replace(/\/$/, "");
  return baseFromHost;
}

async function getRestaurant(slug: string): Promise<MockRestaurant | null> {
  // Clean slug - remove any leading slashes or /menu/ prefix (handle multiple /menu/ prefixes)
  let cleanSlug = slug;
  // Remove all /menu/ prefixes
  while (cleanSlug.startsWith('/menu/') || cleanSlug.startsWith('menu/')) {
    cleanSlug = cleanSlug.replace(/^\/?menu\//, '');
  }
  // Remove leading/trailing slashes
  cleanSlug = cleanSlug.replace(/^\/+/, '').replace(/\/+$/, '');
  
  try {
    const restaurant = await restaurantsApi.getBySlug(cleanSlug);
    if (restaurant) {
      // Transform API response to match expected format
      const r = restaurant as { categories?: Array<{ menuItems?: unknown[] }>; [key: string]: unknown };
      return {
        ...restaurant,
        categories: (r.categories || []).map((cat: any) => ({
          ...cat,
          menuItems: (cat.menuItems || []).map((item: any) => ({
            ...item,
            ratings: [] // Ratings handled separately in API
          }))
        }))
      } as MockRestaurant;
    }
  } catch (error) {
    console.error("API error, using mock data:", error);
  }

  // Fallback to mock data
  return getMockRestaurantBySlug(cleanSlug) ?? null;
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);

  if (!restaurant) {
    notFound();
  }

  const baseUrl = await getMenuBaseUrl();
  const menuUrl = `${baseUrl}/menu/${restaurant.slug}`;
  const getAverageRating = (itemId: string) => {
    // Ratings are already calculated in API response
    const menuItem = restaurant.categories
      .flatMap((cat: any) => cat.menuItems)
      .find((item: any) => item.id === itemId);
    
    return {
      avg: menuItem?.averageRating || 0,
      count: menuItem?.ratingCount || 0
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 scroll-smooth">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {restaurant.logo && (
                <div className="relative w-16 h-16 md:w-20 md:h-20">
                  <Image
                    src={ensureAbsoluteImageUrl(restaurant.logo)}
                    alt={restaurant.name}
                    fill
                    className="object-contain rounded-lg"
                    loading="lazy"
                    sizes="80px"
                  />
                </div>
              )}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {restaurant.name}
                </h1>
                {restaurant.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {restaurant.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <QRCode value={menuUrl} size={80} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!restaurant.categories || restaurant.categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No menu items available yet.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {restaurant.categories.map((category) => (
              <section key={category.id} id={`category-${category.id}`} className="space-y-6 scroll-mt-24">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-gray-600">{category.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.menuItems.map((item) => {
                    const { avg, count } = getAverageRating(item.id);
                    const images = item.image ? [ensureAbsoluteImageUrl(item.image)] : [];

                    return (
                      <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <ImageSlider
                          images={images}
                          alt={item.name}
                          className="w-full"
                        />
                        <CardHeader>
                          <CardTitle className="text-xl">{item.name}</CardTitle>
                          <CardDescription className="text-base">
                            {item.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-primary">
                              ${item.price.toFixed(2)}
                            </span>
                            <Rating
                              menuItemId={item.id}
                              currentRating={avg}
                              ratingCount={count}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} {restaurant.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);

  if (!restaurant) {
    return {
      title: "Restaurant Not Found",
    };
  }

  return {
    title: `${restaurant.name} - Menu`,
    description: restaurant.description || `Menu for ${restaurant.name}`,
  };
}

