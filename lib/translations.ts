export type Locale = "en" | "ar";

export const translations = {
  en: {
    home: "Home",
    ourRestaurants: "Our Restaurants",
    viewMenu: "View Menu",
    adminPanel: "Admin Panel",
    addRestaurant: "Add Restaurant",
    manage: "Manage",
    login: "Login",
    logout: "Logout",
    email: "Email",
    password: "Password",
    noRestaurants: "No restaurants yet",
    getStarted: "Get started by creating your first restaurant.",
    loading: "Loading...",
    backendWarming: "Backend may be warming up",
    darkMode: "Dark mode",
    lightMode: "Light mode",
    arabic: "العربية",
    english: "English",
  },
  ar: {
    home: "الرئيسية",
    ourRestaurants: "مطاعمنا",
    viewMenu: "عرض القائمة",
    adminPanel: "لوحة التحكم",
    addRestaurant: "إضافة مطعم",
    manage: "إدارة",
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    noRestaurants: "لا توجد مطاعم بعد",
    getStarted: "ابدأ بإنشاء مطعمك الأول.",
    loading: "جاري التحميل...",
    backendWarming: "قد يكون الخادم قيد التشغيل",
    darkMode: "الوضع الداكن",
    lightMode: "الوضع الفاتح",
    arabic: "العربية",
    english: "English",
  },
} as const;

const LOCALE_KEY = "locale";

export function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  return (localStorage.getItem(LOCALE_KEY) as Locale) || "en";
}

export function setStoredLocale(locale: Locale) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCALE_KEY, locale);
    document.documentElement.setAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", locale === "ar" ? "ar" : "en");
  }
}
