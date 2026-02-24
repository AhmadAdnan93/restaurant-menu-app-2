"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/ImageUpload";
import { restaurantsApi } from "@/lib/api-client";

export default function NewRestaurantPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    logo: "",
    coverImage: "",
    description: "",
    website: "",
    phone: "",
    facebookUrl: "",
    instagramUrl: "",
    isPublished: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get auth token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast({
          title: "Error",
          description: "Please log in again.",
          variant: "destructive",
        });
        router.push('/login');
        return;
      }

      // Clean the slug before sending (default published so it appears on public list)
      const cleanedData = {
        ...formData,
        slug: cleanSlug(formData.slug),
        website: formData.website || null,
        phone: formData.phone || null,
        facebookUrl: formData.facebookUrl || null,
        instagramUrl: formData.instagramUrl || null,
        isPublished: formData.isPublished ?? true,
      };

      // Use api-client (goes through /api/backend proxy) so auth header is forwarded correctly
      const restaurant = await restaurantsApi.create(cleanedData, token);

      toast({
        title: "Success!",
        description: "Restaurant created successfully.",
      });

      if (restaurant?.id && typeof window !== "undefined") {
        try {
          const raw = sessionStorage.getItem("admin_restaurants_list");
          const list = raw ? JSON.parse(raw) : [];
          list.unshift({
            id: restaurant.id,
            name: restaurant.name ?? cleanedData.name,
            slug: restaurant.slug ?? cleanedData.slug,
            categoryCount: 0,
            _count: { categories: 0 },
          });
          sessionStorage.setItem("admin_restaurants_list", JSON.stringify(list));
        } catch {}
      }

      router.push(`/admin/restaurants/${restaurant.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create restaurant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const cleanSlug = (slug: string) => {
    // Remove any leading slashes, /menu/ prefix, or spaces
    return slug
      .trim()
      .replace(/^\/menu\//, '')
      .replace(/^\//, '')
      .replace(/\/$/, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: formData.slug || generateSlug(name),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/admin">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">New Restaurant</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Details</CardTitle>
            <CardDescription>
              Enter the information for your new restaurant.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                  placeholder="e.g., The Gourmet Kitchen"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  required
                  placeholder="e.g., gourmet-kitchen"
                />
                <p className="text-sm text-gray-500">
                  This will be used in the menu URL: /menu/your-slug
                </p>
              </div>

              <ImageUpload
                label="Restaurant Logo"
                value={formData.logo}
                onChange={(url) => setFormData({ ...formData, logo: url })}
                maxSizeMB={5}
              />

              <ImageUpload
                label="Cover Image"
                value={formData.coverImage}
                onChange={(url) => setFormData({ ...formData, coverImage: url })}
                maxSizeMB={5}
              />

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="A brief description of your restaurant..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone / WhatsApp</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">With country code (e.g. +971501234567)</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook URL</Label>
                  <Input
                    id="facebook"
                    type="url"
                    placeholder="https://facebook.com/yourpage"
                    value={formData.facebookUrl}
                    onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram URL</Label>
                  <Input
                    id="instagram"
                    type="url"
                    placeholder="https://instagram.com/yourpage"
                    value={formData.instagramUrl}
                    onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Restaurant"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

