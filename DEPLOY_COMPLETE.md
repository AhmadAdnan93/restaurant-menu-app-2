# Complete Deployment - Do These 3 Things

I've set up everything I can. **You need to complete 2 quick steps** (about 3 minutes total):

---

## Step 1: Deploy Frontend (Vercel) - 1 min

**Open this link:** https://vercel.com/new/clone?repository-url=https://github.com/AhmadSulieman93/restaurant-menu-app

1. Click **Import**
2. **DO NOT add env vars yet** - click **Deploy** first
3. Wait ~2 min for build to complete
4. **Copy your live URL** (e.g. `https://restaurant-menu-app-xxx.vercel.app`)

---

## Step 2: Deploy Backend (Railway) - 2 min

**Open this link:** https://railway.app/new?repository=https://github.com/AhmadSulieman93/restaurant-menu-app

1. Sign in with GitHub
2. Railway will create a project - click the **service**
3. Go to **Settings**:
   - **Root Directory**: `backend/RestaurantMenu.API`
4. Go to **Variables** → **Add Variable** (paste these one by one):

```
ConnectionStrings__DefaultConnection
(Copy from backend/RestaurantMenu.API/appsettings.json - same value)

CORS_ORIGINS
https://YOUR-VERCEL-URL.vercel.app

ASPNETCORE_ENVIRONMENT
Production
```

5. Replace `YOUR-VERCEL-URL` with your actual Vercel URL from Step 1
6. Go to **Settings** → **Networking** → **Generate Domain**
7. **Copy your Railway URL** (e.g. `https://xxx.up.railway.app`)
8. Add 2 more variables:

```
BaseUrl
https://YOUR-RAILWAY-URL

Frontend__BaseUrl
https://YOUR-VERCEL-URL.vercel.app
```

9. Redeploy: **Deployments** → **⋮** → **Redeploy**

---

## Step 3: Connect Frontend to Backend

Go back to **Vercel** → Your Project → **Settings** → **Environment Variables**

Add:
- `NEXT_PUBLIC_API_URL` = `https://YOUR-RAILWAY-URL/api`
- `NEXT_PUBLIC_APP_URL` = `https://YOUR-VERCEL-URL.vercel.app`

Click **Save** → Go to **Deployments** → **⋮** on latest → **Redeploy**

---

## ✅ Done!

Your live URLs:
- **App:** https://your-vercel-url.vercel.app
- **Login:** https://your-vercel-url.vercel.app/login  
- **Demo:** admin@restaurantmenu.com / Admin@123
