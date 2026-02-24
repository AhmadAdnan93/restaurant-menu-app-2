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
import { Plus, Store, Trash2, RefreshCw, Pencil } from "lucide-react";
import { restaurantsApi, authApi } from "@/lib/api-client";
import { auth } from "@/lib/auth";
import { getMockRestaurants } from "@/lib/mock-data";
import { getCachedRestaurants, setCachedRestaurants } from "@/lib/admin-cache";
import { useLocale } from "@/components/LocaleProvider";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  qrCode: string;
  createdAt: string;
  categoryCount?: number;
  _count?: { categories: number };
}

const SLOW_THRESHOLD_MS = 3000; // Show "Wake backend" after 3s

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLocale();
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
  const [authChecked, setAuthChecked] = useState(false);
  const [needsRoleFix, setNeedsRoleFix] = useState(false);
  const [loggedInEmail, setLoggedInEmail] = useState<string>("");
  const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = auth.getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    const hasAdminRole = auth.isSuperAdmin() || auth.isRestaurantOwner();
    if (hasAdminRole) {
      setAuthChecked(true);
      fetchRestaurants();
      return () => { if (slowTimerRef.current) clearTimeout(slowTimerRef.current); };
    }
    authApi.getCurrentUser(token)
      .then((user: { role?: string; email?: string }) => {
        if (user?.role === "SUPER_ADMIN" || user?.role === "RESTAURANT_OWNER") {
          auth.setAuth(token, { id: (user as any).userId, email: user.email || "", role: user.role, restaurantId: (user as any).restaurantId });
          setAuthChecked(true);
          fetchRestaurants();
        } else {
          setLoggedInEmail(user?.email || "");
          setNeedsRoleFix(true);
          setAuthChecked(true);
        }
      })
      .catch(() => {
        router.push("/login");
      });
    return () => { if (slowTimerRef.current) clearTimeout(slowTimerRef.current); };
  }, [router]);

  const fetchRestaurants = async () => {
    setRefreshing(true);
    setShowWakeRetry(false);
    slowTimerRef.current = setTimeout(() => setShowWakeRetry(true), SLOW_THRESHOLD_MS);
    try {
      const token = auth.getToken();
      if (token) {
        let data: any = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            data = await restaurantsApi.getAll(false);
            break;
          } catch (err) {
            if (attempt < 3) await new Promise((r) => setTimeout(r, 2000));
            else throw err;
          }
        }
        if (Array.isArray(data)) {
          const mapped = data.length > 0 ? data.map((r: any) => ({
            ...r,
            _count: { categories: r.categoryCount ?? 0 },
          })) : [];
          setRestaurants(mapped);
          if (mapped.length > 0) {
            setCachedRestaurants(mapped);
            if (typeof window !== "undefined") sessionStorage.setItem("admin_restaurants_list", JSON.stringify(mapped));
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
    setTimeout(fetchRestaurants, 1000);
  };

  const handleDeleteClick = (restaurant: Restaurant) => {
    setRestaurantToDelete(restaurant);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!restaurantToDelete) return;

    const token = auth.getToken();
    if (!token) {
      toast({ title: t.error, description: t.pleaseLoginAgain, variant: "destructive" });
      router.push('/login');
      return;
    }

    const toDelete = restaurantToDelete;
    setDeleteDialogOpen(false);
    setRestaurantToDelete(null);
    setRestaurants((prev) => prev.filter((r) => r.id !== toDelete.id));
    setCachedRestaurants(restaurants.filter((r) => r.id !== toDelete.id));
    toast({ title: t.deleted, description: t.restaurantRemoved });

    try {
      await restaurantsApi.delete(toDelete.id, token);
    } catch (error: any) {
      console.error("Error deleting restaurant:", error);
      setRestaurants((prev) => [...prev, toDelete]);
      setCachedRestaurants(restaurants);
      toast({
        title: t.deleteFailed,
        description: error.message || t.pleaseLoginAgain,
        variant: "destructive",
      });
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (needsRoleFix) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 relative z-[100]">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle className="text-xl">{t.adminAccessRequired}</CardTitle>
            <CardDescription>
              {t.adminRoleFixDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loggedInEmail && (
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 p-3 rounded">
                You are logged in as: <strong>{loggedInEmail}</strong> — use this exact email in the SQL below.
              </p>
            )}
            <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded text-sm overflow-x-auto">
{`INSERT INTO public.user_roles (user_id, role)
SELECT id, 'SUPER_ADMIN' FROM auth.users WHERE email = '${(loggedInEmail || "admin@restaurantmenu.com").replace(/'/g, "''")}'
ON CONFLICT (user_id) DO UPDATE SET role = 'SUPER_ADMIN';`}
            </pre>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              1. Open Supabase Dashboard → SQL Editor → New query<br />
              2. Paste the SQL above → Run<br />
              3. Click Log out below, then log in again
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={async () => {
                  const token = auth.getToken();
                  if (!token) return;
                  try {
                    const user: any = await authApi.getCurrentUser(token);
                    if (user?.role === "SUPER_ADMIN" || user?.role === "RESTAURANT_OWNER") {
                      auth.setAuth(token, { id: user.userId, email: user.email || "", role: user.role, restaurantId: user.restaurantId });
                      setNeedsRoleFix(false);
                      fetchRestaurants();
                    }
                  } catch {}
                }}
              >
                {t.ranSqlCheckAgain}
              </Button>
              <Button variant="outline" onClick={() => { auth.logout(); router.push("/login"); }}>
                {t.logout}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">{t.home}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.adminPanel}</h1>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/admin/restaurants/new">{t.addRestaurant}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">{t.home}</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showWakeRetry && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-4">
            <p className="text-amber-800 text-sm">{t.backendWarming}</p>
            <Button onClick={wakeAndRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t.wakeBackendRetry}
            </Button>
          </div>
        )}
        {refreshing && restaurants.length > 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t.refreshing}</p>
        )}
        {restaurants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Store className="h-8 w-8 text-primary" />
                  <div className="text-sm text-gray-500">
                    {restaurant._count?.categories || restaurant.categoryCount || 0} {t.categories}
                  </div>
                </div>
                <CardTitle>{restaurant.name}</CardTitle>
                <CardDescription>Slug: {restaurant.slug}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/admin/restaurants/${restaurant.id}`}>{t.manage}</Link>
                  </Button>
                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/admin/restaurants/${restaurant.id}/edit`}>
                      <Pencil className="h-4 w-4 mr-2" />
                      {t.edit}
                    </Link>
                  </Button>
                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/menu/${restaurant.slug.replace(/^\/menu\//, '').replace(/^\//, '')}`} target="_blank">
                      {t.viewMenu}
                    </Link>
                  </Button>
                  <Button
                    className="w-full"
                    variant="destructive"
                    onClick={() => handleDeleteClick(restaurant)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t.delete}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        ) : !refreshing ? (
          <div className="text-center py-12">
            <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t.noRestaurants}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{t.getStarted}</p>
            <Button asChild>
              <Link href="/admin/restaurants/new">{t.addRestaurant}</Link>
            </Button>
          </div>
        ) : null}
      </main>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.deletingRestaurant}</DialogTitle>
            <DialogDescription>
              {t.deleteConfirm}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setRestaurantToDelete(null);
              }}
            >
              {t.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              {t.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
