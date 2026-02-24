"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { restaurantsApi } from "@/lib/api-client";
import { auth } from "@/lib/auth";

export default function EditRestaurantPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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

  useEffect(() => {
    const token = auth.getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    const base = "/api/supabase";
    fetch(`${base}/restaurants/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setFormData({
            name: data.name || "",
            slug: data.slug || "",
            logo: data.logo || "",
            coverImage: data.coverImage || "",
            description: data.description || "",
            website: data.website || "",
            phone: data.phone || "",
            facebookUrl: data.facebookUrl || "",
            instagramUrl: data.instagramUrl || "",
            isPublished: data.isPublished ?? true,
          });
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = auth.getToken();
      if (!token) {
        toast({ title: "Error", description: "Please log in again.", variant: "destructive" });
        router.push("/login");
        return;
      }
      const cleanedData = {
        name: formData.name,
        slug: formData.slug.trim().replace(/^\/menu\//, "").replace(/^\//, "").replace(/\/$/, ""),
        logo: formData.logo || null,
        coverImage: formData.coverImage || null,
        description: formData.description || null,
        website: formData.website || null,
        phone: formData.phone || null,
        facebookUrl: formData.facebookUrl || null,
        instagramUrl: formData.instagramUrl || null,
        isPublished: formData.isPublished,
      };
      await restaurantsApi.update(id, cleanedData, token);
      toast({ title: "Success!", description: "Restaurant updated." });
      router.push(`/admin/restaurants/${id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update restaurant.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href={`/admin/restaurants/${id}`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Restaurant</h1>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="dark:text-white">Restaurant Details</CardTitle>
            <CardDescription className="dark:text-gray-400">Update name, image, and details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: formData.slug || generateSlug(e.target.value),
                    })
                  }
                  required
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  className="dark:bg-gray-700 dark:text-white"
                />
                <p className="text-sm text-gray-500">Menu URL: /menu/{formData.slug || "your-slug"}</p>
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
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublished: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isPublished" className="text-sm font-medium cursor-pointer">
                  Published (visible on public restaurant list)
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="dark:bg-gray-700 dark:text-white"
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
                    className="dark:bg-gray-700 dark:text-white"
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
                    className="dark:bg-gray-700 dark:text-white"
                  />
                  <p className="text-xs text-gray-500">With country code for WhatsApp</p>
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
                    className="dark:bg-gray-700 dark:text-white"
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
                    className="dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push(`/admin/restaurants/${id}`)}>
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
