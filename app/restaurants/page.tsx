"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ensureAbsoluteImageUrl } from "@/lib/image-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, RefreshCw } from "lucide-react";
import { restaurantsApi } from "@/lib/api-client";
import { useLocale } from "@/components/LocaleProvider";

export default function RestaurantsPage() {
  const { t } = useLocale();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = async () => {
    setLoading(true);
    setError(null);
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const data = await restaurantsApi.getAll(true);
        if (Array.isArray(data)) {
          setRestaurants(data);
          setError(null);
          setLoading(false);
          return;
        }
      } catch (err) {
        if (attempt === 3) {
          setError(t.loadError);
        } else {
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.ourRestaurants}</h1>
            <Button asChild variant="outline">
              <Link href="/">{t.home}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && restaurants.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
            <p className="text-gray-600 dark:text-gray-400">{t.loadingRestaurants}</p>
          </div>
        ) : error && restaurants.length === 0 ? (
          <div className="text-center py-12">
            <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={fetchRestaurants} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t.retry}
            </Button>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-12">
            <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t.noRestaurantsAvailable}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t.checkBackLater}
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Button variant="outline" size="sm" onClick={fetchRestaurants} disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t.refresh}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <Card key={restaurant.id} className="hover:shadow-lg transition-shadow dark:bg-gray-800">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    {restaurant.logo && (
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <Image
                          src={ensureAbsoluteImageUrl(restaurant.logo)}
                          alt={restaurant.name}
                          fill
                          className="object-contain rounded-lg"
                        />
                      </div>
                    )}
                    <CardTitle className="text-xl text-gray-900 dark:text-white">{restaurant.name}</CardTitle>
                  </div>
                  {restaurant.description && (
                    <CardDescription className="dark:text-gray-400">{restaurant.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={`/menu/${restaurant.slug}`}>{t.viewMenu}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          </>
        )}
      </main>
    </div>
  );
}
