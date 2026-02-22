"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
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

export default function RestaurantManagePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  // Initialize with mock data immediately
  const [restaurant, setRestaurant] = useState<Restaurant | null>(
    getMockRestaurantById(params.id as string) || null
  );
  const [loading, setLoading] = useState(false);
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

  const fetchRestaurant = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log("No auth token");
        return;
      }

      // Fetch via proxy (same-origin, works in production)
      const base = typeof window !== 'undefined' && !window.location.hostname.includes('localhost')
        ? '/api/backend' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');
      const response = await fetch(`${base}/restaurants/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const detail = await response.json();
        setRestaurant(detail);
      } else if (response.status === 404) {
        console.log("Restaurant not found");
        setRestaurant(null);
      }
    } catch (error) {
      console.error("Error fetching restaurant:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    // Try to fetch from API, but don't block
    fetchRestaurant();
  }, [fetchRestaurant]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast({
          title: "Error",
          description: "Please log in again.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...categoryForm,
          restaurantId: params.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create category");
      }

      toast({ title: "Success!", description: "Category created." });
      setCategoryDialogOpen(false);
      setCategoryForm({ name: "", description: "", order: 0 });
      fetchRestaurant();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create category.",
        variant: "destructive",
      });
    }
  };

  const handleCreateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuItemDialogOpen) return;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast({
          title: "Error",
          description: "Please log in again.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/menu-items", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...menuItemForm,
          categoryId: menuItemDialogOpen,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create menu item");
      }

      toast({ title: "Success!", description: "Menu item created." });
      setMenuItemDialogOpen(null);
      setMenuItemForm({
        name: "",
        description: "",
        price: "",
        image: "",
        order: 0,
      });
      fetchRestaurant();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create menu item.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
                {restaurant.name}
              </h1>
              <p className="text-gray-600">Manage menu and categories</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
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
                <Button type="submit" className="w-full">
                  Create Category
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-8">
          {(restaurant.categories || []).map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{category.name}</CardTitle>
                    {category.description && (
                      <CardDescription>{category.description}</CardDescription>
                    )}
                  </div>
                  <Dialog
                    open={menuItemDialogOpen === category.id}
                    onOpenChange={(open) =>
                      setMenuItemDialogOpen(open ? category.id : null)
                    }
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
                        <Button type="submit" className="w-full">
                          Create Item
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
                          <h4 className="font-semibold mb-2">{item.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {item.description}
                          </p>
                          <p className="text-lg font-bold text-primary">
                            ${item.price.toFixed(2)}
                          </p>
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

