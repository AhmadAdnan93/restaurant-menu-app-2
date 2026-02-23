"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/LocaleProvider";
import { auth } from "@/lib/auth";

export default function Home() {
  const { t } = useLocale();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !auth.getToken()) {
      router.replace("/login");
    }
  }, [mounted, router]);

  if (!mounted || !auth.getToken()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
          {t.appTitle}
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          {t.appTagline}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/admin">{t.adminPanel}</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6">
            <Link href="/restaurants">{t.viewRestaurants}</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="text-lg px-8 py-6"
            onClick={() => {
              auth.logout();
              router.replace("/login");
            }}
          >
            {t.logout}
          </Button>
        </div>
      </div>
    </div>
  );
}
