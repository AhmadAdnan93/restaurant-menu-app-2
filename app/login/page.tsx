"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authApi } from "@/lib/api-client";
import { auth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { useLocale } from "@/components/LocaleProvider";

export default function LoginPage() {
  const { t } = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authApi.login(email, password);
      auth.setAuth(response.token, {
        id: response.userId,
        email: response.email,
        role: response.role,
        restaurantId: response.restaurantId,
      });
      toast({
        title: t.success,
        description: t.loggedInSuccess,
      });
      router.push(response.role === "SUPER_ADMIN" || response.role === "RESTAURANT_OWNER" ? "/admin" : "/");
      router.refresh();
    } catch (error: any) {
      toast({
        title: t.error,
        description: error.message || t.loginFailed,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{t.loginTitle}</CardTitle>
          <CardDescription>{t.loginDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@restaurantmenu.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t.password}</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t.loggingIn : t.login}
            </Button>
          </form>
          <div className="mt-4 text-sm text-center text-gray-600">
            <p>{t.demoAccounts}</p>
            <p className="mt-2">Super Admin: admin@restaurantmenu.com / Admin@123</p>
            <p>Owner: mario@marioskitchen.com / Mario@123</p>
          </div>
          <div className="mt-4 text-center">
            <Button asChild variant="link">
              <Link href="/">{t.backToHome}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

