"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Store, Package, Star } from "lucide-react";
import { getMockRestaurants } from "@/lib/mock-data";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  qrCode: string;
  createdAt: string;
  _count: {
    categories: number;
  };
}

export default function AdminPage() {
  // Initialize with mock data immediately
  const [restaurants, setRestaurants] = useState<Restaurant[]>(getMockRestaurants());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Try to fetch from API, but don't block on it
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch("/api/restaurants");
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setRestaurants(data);
        }
      }
    } catch (error) {
      // Silently fail - we already have mock data
      console.log("Using mock data for admin page");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/admin/restaurants/new">Add Restaurant</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Store className="h-8 w-8 text-primary" />
                  <div className="text-sm text-gray-500">
                    {restaurant._count.categories} categories
                  </div>
                </div>
                <CardTitle>{restaurant.name}</CardTitle>
                <CardDescription>Slug: {restaurant.slug}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/admin/restaurants/${restaurant.id}`}>
                      Manage
                    </Link>
                  </Button>
                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/menu/${restaurant.slug}`} target="_blank">
                      View Menu
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {restaurants.length === 0 && (
          <div className="text-center py-12">
            <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No restaurants yet
            </h3>
            <p className="text-gray-500 mb-6">
              Get started by creating your first restaurant.
            </p>
            <Button asChild>
              <Link href="/admin/restaurants/new">Add Restaurant</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

