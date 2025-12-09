# 🚀 دليل النشر الكامل - Restaurant Menu App

## 📋 المتطلبات الأساسية

### 1. PostgreSQL Database
- استخدم **Supabase** (مجاني) أو **Railway** أو **Render**
- احصل على Connection String

### 2. Hosting
- **Frontend**: Vercel (مجاني)
- **Backend**: Railway أو Render (يدعم .NET)

### 3. PayPal
- احصل على Client ID و Secret من PayPal Developer

---

## 🔧 خطوات النشر

### المرحلة 1: إعداد Database

#### خيار 1: Supabase (مجاني)
1. اذهب إلى: https://supabase.com
2. أنشئ حساب جديد
3. أنشئ Project جديد
4. اذهب إلى Settings > Database
5. انسخ Connection String

#### خيار 2: Railway
1. اذهب إلى: https://railway.app
2. أنشئ حساب جديد
3. أنشئ PostgreSQL Database
4. انسخ Connection String

---

### المرحلة 2: نشر Backend (.NET API)

#### على Railway:
1. أنشئ Project جديد
2. اضف PostgreSQL Database
3. اضف .NET Service
4. ارفع Backend Code
5. اضف Environment Variables:
   - `DATABASE_URL=your-postgres-connection-string`
   - `JWT_SECRET=your-secret-key`
   - `PAYPAL_CLIENT_ID=your-paypal-id`
   - `PAYPAL_CLIENT_SECRET=your-paypal-secret`

#### على Render:
1. اذهب إلى: https://render.com
2. أنشئ Web Service جديد
3. ارفع Backend Code
4. اضف Environment Variables نفسها

---

### المرحلة 3: نشر Frontend (Next.js)

#### على Vercel:
1. اذهب إلى: https://vercel.com
2. سجّل دخول بحساب GitHub
3. اضف Repository
4. اضف Environment Variables:
   - `NEXT_PUBLIC_API_URL=https://your-backend-url.com`
   - `NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-id`

---

## 📝 Environment Variables Checklist

### Backend (.NET)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key-min-32-chars
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret
CORS_ORIGINS=https://your-frontend-url.vercel.app
```

### Frontend (Next.js)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id
```

---

## ✅ Checklist قبل النشر

- [ ] Database منشأة ومتصلة
- [ ] Backend يعمل محلياً
- [ ] Frontend يتصل بـ Backend بنجاح
- [ ] PayPal Integration يعمل
- [ ] Environment Variables محددة
- [ ] CORS محددة بشكل صحيح

---

## 🔗 روابط مفيدة

- Supabase: https://supabase.com
- Railway: https://railway.app
- Render: https://render.com
- Vercel: https://vercel.com
- PayPal Developer: https://developer.paypal.com

