import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ImageSlider } from "@/components/ImageSlider";
import { Rating } from "@/components/Rating";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCode } from "@/components/QRCode";
import { getMockRestaurantBySlug } from "@/lib/mock-data";

async function getRestaurant(slug: string) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
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

    if (restaurant) return restaurant;
  } catch (error) {
    console.error("Database error, using mock data:", error);
  }

  // Fallback to mock data
  return getMockRestaurantBySlug(slug);
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

  const menuUrl = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/menu/${restaurant.slug}`;
  const averageRatings = restaurant.categories.flatMap((cat) =>
    cat.menuItems.map((item) => {
      const ratings = item.ratings || [];
      const avg =
        ratings.length > 0
          ? ratings.reduce((sum: number, r: any) => sum + (r.value || 0), 0) / ratings.length
          : 0;
      return { itemId: item.id, avg, count: ratings.length };
    })
  );

  const getAverageRating = (itemId: string) => {
    const rating = averageRatings.find((r) => r.itemId === itemId);
    return { avg: rating?.avg || 0, count: rating?.count || 0 };
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
                    src={restaurant.logo}
                    alt={restaurant.name}
                    fill
                    className="object-contain rounded-lg"
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
        {restaurant.categories.length === 0 ? (
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
                    const images = item.image ? [item.image] : [];

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

