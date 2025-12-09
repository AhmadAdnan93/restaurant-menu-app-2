"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { restaurantsApi, authApi } from "@/lib/api-client";
import { auth } from "@/lib/auth";
import { Store, Users, ShoppingCart, DollarSign, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function SuperAdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated() || !auth.isSuperAdmin()) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = auth.getToken();
      if (token) {
        const restaurantsData = await restaurantsApi.getAll(false);
        setRestaurants(restaurantsData);
        // TODO: Add users API call when available
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRestaurant = async (id: string) => {
    try {
      const token = auth.getToken();
      if (token) {
        await restaurantsApi.update(id, { status: "ACTIVE", isPublished: true }, token);
        toast({
          title: "Success",
          description: "Restaurant approved",
        });
        fetchData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve restaurant",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Super Admin Panel</h1>
            <div className="flex gap-4">
              <Button onClick={() => { auth.logout(); router.push("/"); }} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Restaurants</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{restaurants.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Store className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {restaurants.filter((r) => r.status === "ACTIVE").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Store className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {restaurants.filter((r) => r.status === "PENDING").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <Store className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {restaurants.filter((r) => r.isPublished).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Restaurants List */}
        <Card>
          <CardHeader>
            <CardTitle>All Restaurants</CardTitle>
            <CardDescription>Manage all restaurants in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">{restaurant.name}</h3>
                    <p className="text-sm text-gray-500">Slug: {restaurant.slug}</p>
                    <p className="text-sm text-gray-500">Status: {restaurant.status}</p>
                  </div>
                  <div className="flex gap-2">
                    {restaurant.status === "PENDING" && (
                      <Button
                        size="sm"
                        onClick={() => handleApproveRestaurant(restaurant.id)}
                      >
                        Approve
                      </Button>
                    )}
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/restaurants/${restaurant.id}`}>Manage</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

