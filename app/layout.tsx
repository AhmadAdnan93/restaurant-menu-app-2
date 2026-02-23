import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LocaleProvider } from "@/components/LocaleProvider";
import { ThemeLocaleToggle } from "@/components/ThemeLocaleToggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Restaurant Menu - Digital Menu Solution",
  description: "Modern digital menu solution for restaurants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=document.documentElement;var l=localStorage.getItem('locale')||'en';var th=localStorage.getItem('theme')||'light';t.setAttribute('dir',l==='ar'?'rtl':'ltr');t.setAttribute('lang',l==='ar'?'ar':'en');t.classList.toggle('dark',th==='dark');})();`,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <LocaleProvider>
            {children}
            <div className="fixed bottom-4 right-4 z-50">
              <ThemeLocaleToggle />
            </div>
            <Toaster />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

