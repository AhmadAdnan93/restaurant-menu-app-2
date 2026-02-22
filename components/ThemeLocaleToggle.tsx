"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun, Languages } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useLocale } from "@/components/LocaleProvider";

export function ThemeLocaleToggle() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="flex items-center gap-1 bg-background/90 dark:bg-gray-800/90 backdrop-blur border rounded-full px-2 py-1 shadow-lg">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        title={theme === "dark" ? t.lightMode : t.darkMode}
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLocale(locale === "en" ? "ar" : "en")}
        className="gap-1"
      >
        <Languages className="h-4 w-4" />
        {locale === "en" ? t.arabic : t.english}
      </Button>
    </div>
  );
}
