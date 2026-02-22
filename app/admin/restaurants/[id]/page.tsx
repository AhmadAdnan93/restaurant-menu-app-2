"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Edit, Trash2, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getMockRestaurantById } from "@/lib/mock-data";
import { ImageUpload } from "@/components/ImageUpload";
import { categoriesApi, menuItemsApi } from "@/lib/api-client";

interface Category {
  id: string;
  name: string;
  description: string | null;
  order: number;
  menuItems: MenuItem[];
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  order: number;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  categories: Category[];
}

// Get restaurant from admin list (instant, no API wait)
function getFromAdminList(id: string): { name: string; slug: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("admin_restaurants_list");
    if (!raw) return null;
    const list = JSON.parse(raw);
    const r = list?.find((x: any) => x.id === id);
    return r ? { name: r.name, slug: r.slug } : null;
  } catch {
    return null;
  }
}

export default function RestaurantManagePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;
  // Instant: use admin list or mock (for UUIDs mock returns null)
  const fromList = getFromAdminList(id);
  const mockRest = getMockRestaurantById(id);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(() => {
    if (mockRest) return mockRest;
    if (fromList) return { id, name: fromList.name, slug: fromList.slug, logo: null, description: null, categories: [] };
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [menuItemDialogOpen, setMenuItemDialogOpen] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    order: 0,
  });
  const [menuItemForm, setMenuItemForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    order: 0,
  });
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [creatingMenuItem, setCreatingMenuItem] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);

  const fetchRestaurant = useCallback(async () => {
    setLoading(true);
    setFetchFailed(false);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const isProd = typeof window !== "undefined" && !window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1");
      const apiUrl = isProd ? `${window.location.origin}/api/backend` : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(`${apiUrl}/restaurants/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(t);

      if (response.ok) {
        const detail = await response.json();
        setRestaurant(detail);
        setFetchFailed(false);
      } else if (response.status === 404) {
        setRestaurant(null);
      }
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      setFetchFailed(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRestaurant();
    // Warm up backend (Railway cold start) so create actions are faster
    if (typeof window !== "undefined" && !window.location.hostname.includes("localhost")) {
      const base = "/api/backend";
      fetch(`${base}/restaurants?publishedOnly=true`).catch(() => {});
    }
  }, [fetchRestaurant]);

  const doCreateCategory = async (retry = false): Promise<boolean> => {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ ...categoryForm, restaurantId: params.id }),
    });
    if (res.ok) return true;
    const err = await res.json().catch(() => ({}));
    if (res.status === 504 && !retry) return false;
    throw new Error(err.error || "Failed to create category");
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    setCreatingCategory(true);
    try {
      await categoriesApi.update(editingCategory.id, categoryForm, token);
      toast({ title: "Success!", description: "Category updated." });
      setEditingCategory(null);
      setCategoryForm({ name: "", description: "", order: 0 });
      fetchRestaurant();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update.", variant: "destructive" });
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    try {
      await categoriesApi.delete(cat.id, token);
      toast({ title: "Success!", description: "Category deleted." });
      fetchRestaurant();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to delete.", variant: "destructive" });
    }
  };

  const handleEditMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMenuItem) return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    setCreatingMenuItem(true);
    try {
      await menuItemsApi.update(editingMenuItem.id, {
        name: menuItemForm.name,
        description: menuItemForm.description,
        price: parseFloat(menuItemForm.price) || 0,
        image: menuItemForm.image || null,
        order: menuItemForm.order,
      }, token);
      toast({ title: "Success!", description: "Menu item updated." });
      setEditingMenuItem(null);
      setMenuItemForm({ name: "", description: "", price: "", image: "", order: 0 });
      setMenuItemDialogOpen(null);
      fetchRestaurant();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update.", variant: "destructive" });
    } finally {
      setCreatingMenuItem(false);
    }
  };

  const handleDeleteMenuItem = async (item: MenuItem) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    try {
      await menuItemsApi.delete(item.id, token);
      toast({ title: "Success!", description: "Menu item deleted." });
      fetchRestaurant();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to delete.", variant: "destructive" });
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingCategory(true);
    try {
      let ok = await doCreateCategory(false);
      if (!ok) {
        toast({ title: "Retrying...", description: "Backend warming up" });
        await new Promise(r => setTimeout(r, 5000));
        ok = await doCreateCategory(true);
      }
      if (ok) {
        toast({ title: "Success!", description: "Category created." });
        setCategoryDialogOpen(false);
        setCategoryForm({ name: "", description: "", order: 0 });
        fetchRestaurant();
      } else {
        throw new Error("Backend took too long. Try again in a moment.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create category.",
        variant: "destructive",
      });
    } finally {
      setCreatingCategory(false);
    }
  };

  const doCreateMenuItem = async (attempt: number): Promise<boolean> => {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 15000); // 15s max per attempt
    try {
      const res = await fetch("/api/menu-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...menuItemForm,
          categoryId: menuItemDialogOpen,
        }),
        signal: controller.signal,
      });
      clearTimeout(t);
      if (res.ok) return true;
      const err = await res.json().catch(() => ({}));
      if ((res.status === 504 || res.status === 502) && attempt < 3) return false; // retriable
      throw new Error(err.error || "Failed to create menu item");
    } catch (e: any) {
      clearTimeout(t);
      if ((e?.name === "AbortError" || e?.message?.includes("timeout")) && attempt < 3) return false;
      throw e;
    }
  };

  const handleCreateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuItemDialogOpen) return;
    setCreatingMenuItem(true);
    try {
      for (let attempt = 1; attempt <= 3; attempt++) {
        const ok = await doCreateMenuItem(attempt);
        if (ok) {
          toast({ title: "Success!", description: "Menu item created." });
          setMenuItemDialogOpen(null);
          setMenuItemForm({ name: "", description: "", price: "", image: "", order: 0 });
          fetchRestaurant();
          return;
        }
        if (attempt < 3) {
          toast({ title: "Retrying...", description: `Attempt ${attempt} timed out. Retrying in 5s...` });
          await new Promise(r => setTimeout(r, 5000));
        }
      }
      throw new Error("Backend took too long after 3 attempts. Try again.");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create menu item.",
        variant: "destructive",
      });
    } finally {
      setCreatingMenuItem(false);
    }
  };

  const hasData = restaurant && (restaurant.categories?.length !== undefined || restaurant.name);
  const showNotFound = !hasData && !loading;
  const showLoading = !hasData && loading;

  if (showLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-2">Loading restaurant...</p>
          {fetchFailed && (
            <Button variant="outline" size="sm" onClick={fetchRestaurant} className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (showNotFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Restaurant not found</p>
          <Button asChild>
            <Link href="/admin">Back to Admin</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/admin">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {restaurant!.name}
              </h1>
              <p className="text-gray-600">Manage menu and categories</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(loading || fetchFailed) && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-4">
            {loading ? <p className="text-amber-800 text-sm">Loading details...</p> : <p className="text-amber-800 text-sm">Load failed. Backend may be cold.</p>}
            {fetchFailed && (
              <Button variant="outline" size="sm" onClick={fetchRestaurant}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        )}
        <div className="mb-6">
          <Dialog
            open={!!editingCategory}
            onOpenChange={(open) => {
              if (!open) setEditingCategory(null);
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogDescription>
                  Update the category details.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditCategory} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-cat-name">Name *</Label>
                  <Input
                    id="edit-cat-name"
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cat-desc">Description</Label>
                  <Textarea
                    id="edit-cat-desc"
                    value={categoryForm.description}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cat-order">Order</Label>
                  <Input
                    id="edit-cat-order"
                    type="number"
                    value={categoryForm.order}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <Button type="submit" className="w-full" disabled={creatingCategory}>
                  {creatingCategory ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog
            open={!!editingMenuItem}
            onOpenChange={(open) => {
              if (!open) setEditingMenuItem(null);
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Menu Item</DialogTitle>
                <DialogDescription>
                  Update the menu item details.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditMenuItem} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-item-name">Name *</Label>
                  <Input
                    id="edit-item-name"
                    value={menuItemForm.name}
                    onChange={(e) =>
                      setMenuItemForm({ ...menuItemForm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-item-desc">Description *</Label>
                  <Textarea
                    id="edit-item-desc"
                    value={menuItemForm.description}
                    onChange={(e) =>
                      setMenuItemForm({
                        ...menuItemForm,
                        description: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-item-price">Price *</Label>
                  <Input
                    id="edit-item-price"
                    type="number"
                    step="0.01"
                    value={menuItemForm.price}
                    onChange={(e) =>
                      setMenuItemForm({
                        ...menuItemForm,
                        price: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <ImageUpload
                  label="Menu Item Image"
                  value={menuItemForm.image}
                  onChange={(url) =>
                    setMenuItemForm({ ...menuItemForm, image: url })
                  }
                  maxSizeMB={5}
                />
                <div className="space-y-2">
                  <Label htmlFor="edit-item-order">Order</Label>
                  <Input
                    id="edit-item-order"
                    type="number"
                    value={menuItemForm.order}
                    onChange={(e) =>
                      setMenuItemForm({
                        ...menuItemForm,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <Button type="submit" className="w-full" disabled={creatingMenuItem}>
                  {creatingMenuItem ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Category</DialogTitle>
                <DialogDescription>
                  Create a new category for menu items.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cat-name">Name *</Label>
                  <Input
                    id="cat-name"
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-desc">Description</Label>
                  <Textarea
                    id="cat-desc"
                    value={categoryForm.description}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-order">Order</Label>
                  <Input
                    id="cat-order"
                    type="number"
                    value={categoryForm.order}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <Button type="submit" className="w-full" disabled={creatingCategory}>
                  {creatingCategory ? "Creating..." : "Create Category"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-8">
          {(restaurant!.categories || []).map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{category.name}</CardTitle>
                    {category.description && (
                      <CardDescription>{category.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingCategory(category);
                        setCategoryForm({
                          name: category.name,
                          description: category.description || "",
                          order: category.order,
                        });
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteCategory(category)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                    <Dialog
                    open={menuItemDialogOpen === category.id}
                    onOpenChange={(open) => {
                      setMenuItemDialogOpen(open ? category.id : null);
                      if (open && typeof window !== "undefined") {
                        fetch(`${window.location.origin}/api/backend/restaurants/${id}`).catch(() => {});
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>New Menu Item</DialogTitle>
                        <DialogDescription>
                          Add a new item to {category.name}.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateMenuItem} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="item-name">Name *</Label>
                          <Input
                            id="item-name"
                            value={menuItemForm.name}
                            onChange={(e) =>
                              setMenuItemForm({
                                ...menuItemForm,
                                name: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="item-desc">Description *</Label>
                          <Textarea
                            id="item-desc"
                            value={menuItemForm.description}
                            onChange={(e) =>
                              setMenuItemForm({
                                ...menuItemForm,
                                description: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="item-price">Price *</Label>
                          <Input
                            id="item-price"
                            type="number"
                            step="0.01"
                            value={menuItemForm.price}
                            onChange={(e) =>
                              setMenuItemForm({
                                ...menuItemForm,
                                price: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <ImageUpload
                          label="Menu Item Image"
                          value={menuItemForm.image}
                          onChange={(url) =>
                            setMenuItemForm({
                              ...menuItemForm,
                              image: url,
                            })
                          }
                          maxSizeMB={5}
                        />
                        <div className="space-y-2">
                          <Label htmlFor="item-order">Order</Label>
                          <Input
                            id="item-order"
                            type="number"
                            value={menuItemForm.order}
                            onChange={(e) =>
                              setMenuItemForm({
                                ...menuItemForm,
                                order: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={creatingMenuItem}>
                          {creatingMenuItem ? "Creating... (may take a minute)" : "Create Item"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.menuItems.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No menu items in this category yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.menuItems.map((item) => (
                        <Card key={item.id} className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold mb-2">{item.name}</h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {item.description}
                              </p>
                              <p className="text-lg font-bold text-primary">
                                ${item.price.toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setEditingMenuItem(item);
                                  setMenuItemForm({
                                    name: item.name,
                                    description: item.description,
                                    price: String(item.price),
                                    image: item.image || "",
                                    order: item.order,
                                  });
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteMenuItem(item)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

