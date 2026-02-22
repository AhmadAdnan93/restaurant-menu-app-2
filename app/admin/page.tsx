"use client";

import { useState, useEffect } from "react";
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
import { Plus, Store, Package, Star, Trash2 } from "lucide-react";
import { restaurantsApi } from "@/lib/api-client";
import { auth } from "@/lib/auth";
import { getMockRestaurants } from "@/lib/mock-data";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  qrCode: string;
  createdAt: string;
  categoryCount?: number;
  _count?: {
    categories: number;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const token = auth.getToken();
    if (!token || (!auth.isSuperAdmin() && !auth.isRestaurantOwner())) {
      router.push('/login');
      return;
    }
    fetchRestaurants();
  }, [router]);

  const fetchRestaurants = async (retry = false) => {
    setLoading(true);
    try {
      const token = auth.getToken();
      if (!token) {
        setRestaurants([]);
        return;
      }
      const data = await restaurantsApi.getAll(false);
      if (Array.isArray(data)) {
        setRestaurants(data.map((r: any) => ({
          ...r,
          _count: { categories: r.categoryCount || 0 }
        })));
      }
    } catch (error) {
      console.log("API error:", error);
      if (!retry) {
        await new Promise(r => setTimeout(r, 2000));
        return fetchRestaurants(true);
      }
      setRestaurants(getMockRestaurants().map((r: any) => ({
        ...r,
        _count: { categories: r.categoryCount ?? r._count?.categories ?? 0 }
      })));
    } finally {
      setLoading(false);
    }
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

      // Remove from list
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
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
            <p className="text-gray-600">Loading restaurants...</p>
            <p className="text-sm text-gray-500 mt-1">Backend may be warming up</p>
          </div>
        ) : restaurants.length === 0 ? (
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
        ) : (
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

      {/* Delete Confirmation Dialog */}
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

