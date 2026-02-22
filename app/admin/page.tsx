"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Store, Trash2, RefreshCw } from "lucide-react";
import { restaurantsApi } from "@/lib/api-client";
import { auth } from "@/lib/auth";
import { getMockRestaurants } from "@/lib/mock-data";
import { getCachedRestaurants, setCachedRestaurants } from "@/lib/admin-cache";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  qrCode: string;
  createdAt: string;
  categoryCount?: number;
  _count?: { categories: number };
}

const SLOW_THRESHOLD_MS = 12000; // Show "Wake backend" after 12s

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  // Instant load: cache first, then mock, then API (< 2 sec rule)
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    const cached = getCachedRestaurants();
    if (cached?.length) {
      const mapped = cached.map((r) => ({ ...r, _count: { categories: r.categoryCount ?? r._count?.categories ?? 0 } }));
      if (typeof window !== "undefined") sessionStorage.setItem("admin_restaurants_list", JSON.stringify(mapped));
      return mapped;
    }
    return getMockRestaurants();
  });
  const [refreshing, setRefreshing] = useState(false);
  const [showWakeRetry, setShowWakeRetry] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null);
  const [deleting, setDeleting] = useState(false);
  const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated() || (!auth.isSuperAdmin() && !auth.isRestaurantOwner())) {
      router.push("/login");
      return;
    }
    fetchRestaurants();
    return () => {
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    };
  }, [router]);

  const fetchRestaurants = async () => {
    setRefreshing(true);
    setShowWakeRetry(false);
    slowTimerRef.current = setTimeout(() => setShowWakeRetry(true), SLOW_THRESHOLD_MS);
    try {
      const token = auth.getToken();
      if (token) {
        const data = await restaurantsApi.getAll(false);
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((r: any) => ({
            ...r,
            _count: { categories: r.categoryCount ?? 0 },
          }));
          setRestaurants(mapped);
          setCachedRestaurants(mapped);
          if (typeof window !== "undefined") {
            sessionStorage.setItem("admin_restaurants_list", JSON.stringify(mapped));
          }
        }
      }
    } catch (error) {
      console.log("API error, using cached/mock data:", error);
    } finally {
      setRefreshing(false);
      setShowWakeRetry(false);
      if (slowTimerRef.current) {
        clearTimeout(slowTimerRef.current);
        slowTimerRef.current = null;
      }
    }
  };

  const wakeAndRetry = () => {
    setShowWakeRetry(false);
    const token = auth.getToken();
    if (token && typeof window !== "undefined") {
      fetch(`${window.location.origin}/api/backend/restaurants?publishedOnly=false`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    setTimeout(fetchRestaurants, 2000);
  };

  const handleDeleteClick = (restaurant: Restaurant) => {
    setRestaurantToDelete(restaurant);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!restaurantToDelete) return;

    setDeleting(true);
    try {
      const token = auth.getToken();
      if (!token) {
        toast({
          title: "Error",
          description: "Please log in again.",
          variant: "destructive",
        });
        router.push('/login');
        return;
      }

      await restaurantsApi.delete(restaurantToDelete.id, token);
      
      toast({
        title: "Success",
        description: "Restaurant deleted successfully.",
      });

      setRestaurants(restaurants.filter(r => r.id !== restaurantToDelete.id));
      setDeleteDialogOpen(false);
      setRestaurantToDelete(null);
    } catch (error: any) {
      console.error("Error deleting restaurant:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete restaurant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
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
        {showWakeRetry && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-4">
            <p className="text-amber-800 text-sm">Backend may be cold. Wake it and retry?</p>
            <Button onClick={wakeAndRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Wake backend & Retry
            </Button>
          </div>
        )}
        {refreshing && restaurants.length > 0 && (
          <p className="text-sm text-gray-500 mb-4">Refreshing...</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Store className="h-8 w-8 text-primary" />
                  <div className="text-sm text-gray-500">
                    {restaurant._count?.categories || restaurant.categoryCount || 0} categories
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
                    <Link href={`/menu/${restaurant.slug.replace(/^\/menu\//, '').replace(/^\//, '')}`} target="_blank">
                      View Menu
                    </Link>
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="destructive"
                    onClick={() => handleDeleteClick(restaurant)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
      </main>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Restaurant</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{restaurantToDelete?.name}&quot;? This action cannot be undone and will permanently delete the restaurant and all its data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setRestaurantToDelete(null);
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
