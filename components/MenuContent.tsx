"use client";

import Image from "next/image";
import Link from "next/link";
import { ensureAbsoluteImageUrl } from "@/lib/image-utils";
import { ImageSlider } from "@/components/ImageSlider";
import { Rating } from "@/components/Rating";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCode } from "@/components/QRCode";
import { useLocale } from "@/components/LocaleProvider";
import type { MenuRestaurant } from "@/lib/supabase/menu";
import { Globe, MessageCircle } from "lucide-react";

interface MenuContentProps {
  restaurant: MenuRestaurant;
  menuUrl: string;
}

function toWhatsAppUrl(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  return `https://wa.me/${cleaned}`;
}

export function MenuContent({ restaurant, menuUrl }: MenuContentProps) {
  const { t } = useLocale();

  const getAverageRating = (itemId: string) => {
    const menuItem = restaurant.categories
      .flatMap((cat) => cat.menuItems)
      .find((item) => item.id === itemId);
    return {
      avg: menuItem?.averageRating || 0,
      count: menuItem?.ratingCount || 0,
    };
  };

  const hasSocial =
    restaurant.website ||
    restaurant.phone ||
    restaurant.facebookUrl ||
    restaurant.instagramUrl;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 scroll-smooth transition-colors">
      {/* Cover photo - full width at top */}
      <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
        {restaurant.coverImage ? (
          <Image
            src={ensureAbsoluteImageUrl(restaurant.coverImage)}
            alt={`${restaurant.name} cover`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
        )}
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
      </div>

      {/* Logo, name, description & QR - overlapping / below cover */}
      <header className="relative -mt-16 md:-mt-24 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center gap-4 md:gap-6">
              {restaurant.logo && (
                <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <Image
                    src={ensureAbsoluteImageUrl(restaurant.logo)}
                    alt={restaurant.name}
                    fill
                    className="object-contain"
                    sizes="96px"
                  />
                </div>
              )}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {restaurant.name}
                </h1>
                {restaurant.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 max-w-md">{restaurant.description}</p>
                )}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-700 p-2 rounded-xl shadow-sm flex-shrink-0">
              <QRCode value={menuUrl} size={80} />
            </div>
          </div>
        </div>
      </header>

      {/* Social media section - frosted container */}
      {hasSocial && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 transition-colors">
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
              {restaurant.website && (
                <Link
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                    <Globe className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium">Website</span>
                </Link>
              )}
              {restaurant.phone && (
                <Link
                  href={toWhatsAppUrl(restaurant.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-xs font-medium">WhatsApp</span>
                </Link>
              )}
              {restaurant.facebookUrl && (
                <Link
                  href={restaurant.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium">Facebook</span>
                </Link>
              )}
              {restaurant.instagramUrl && (
                <Link
                  href={restaurant.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center group-hover:bg-pink-200 dark:group-hover:bg-pink-800/50 transition-colors">
                    <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium">Instagram</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Menu Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-6">
        {!restaurant.categories || restaurant.categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">{t.noMenuItems}</p>
          </div>
        ) : (
          <div className="space-y-12">
            {restaurant.categories.map((category) => (
              <section
                key={category.id}
                id={`category-${category.id}`}
                className="space-y-6 scroll-mt-24"
              >
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-gray-600 dark:text-gray-400">{category.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.menuItems.map((item) => {
                    const { avg, count } = getAverageRating(item.id);
                    const images = item.image ? [ensureAbsoluteImageUrl(item.image)] : [];

                    return (
                      <Card
                        key={item.id}
                        className="overflow-hidden hover:shadow-lg transition-all dark:bg-gray-800 dark:border-gray-700"
                      >
                        <ImageSlider
                          images={images}
                          alt={item.name}
                          className="w-full"
                        />
                        <CardHeader>
                          <CardTitle className="text-xl dark:text-white">{item.name}</CardTitle>
                          <CardDescription className="text-base dark:text-gray-400">
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

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} {restaurant.name}. {t.allRightsReserved}
          </p>
        </div>
      </footer>
    </div>
  );
}
