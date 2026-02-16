"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { restaurantsApi, ordersApi } from "@/lib/api-client";
import { auth } from "@/lib/auth";
import { Store, Plus, Edit, BarChart3 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function OwnerDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated() || !auth.isRestaurantOwner()) {
      router.push("/login");
      return;
    }
    fetchRestaurantData();
  }, [router]);

  const fetchRestaurantData = async () => {
    setLoading(true);
    try {
      const token = auth.getToken();
      const user = auth.getUser();
      
      if (token && user?.restaurantId) {
        const restaurantData = await restaurantsApi.getById(user.restaurantId);
        setRestaurant(restaurantData);

        const ordersData = (await ordersApi.getMyOrders(token)) as Array<{ restaurantId?: string }>;
        // Filter orders for this restaurant
        const restaurantOrders = ordersData.filter((o) => o.restaurantId === user.restaurantId);
        setOrders(restaurantOrders);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load restaurant data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">No restaurant assigned</p>
          <Button asChild>
            <Link href="/admin">Go to Admin</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
              <p className="text-gray-600">Restaurant Owner Dashboard</p>
            </div>
            <div className="flex gap-4">
              <Button asChild variant="outline">
                <Link href={`/menu/${restaurant.slug}`} target="_blank">
                  View Public Menu
                </Link>
              </Button>
              <Button onClick={() => { auth.logout(); router.push("/"); }} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Manage Menu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={`/admin/restaurants/${restaurant.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Menu
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
              <p className="text-sm text-gray-500">Total orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href={`/admin/restaurants/${restaurant.id}`}>
                  Add Menu Item
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from your restaurant</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 10).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                      <p className="text-sm text-gray-500">
                        {order.customerName} - ${order.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">Status: {order.status}</p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/orders/${order.id}`}>View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

