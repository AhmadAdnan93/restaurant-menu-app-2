"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/LocaleProvider";

export default function Home() {
  const { t } = useLocale();

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
          <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6">
            <Link href="/login">{t.login}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
