# 🚀 Click to Deploy – Get Your Live URL in 5 Minutes

Your code is pushed to: **https://github.com/AhmadSulieman93/restaurant-menu-app**

---

## Step 1: Deploy Backend (Railway) – 2 min

1. **Click here:** https://railway.app/new/template (or go to railway.app)
2. Choose **"Deploy from GitHub repo"**
3. Select **`AhmadSulieman93/restaurant-menu-app`**
4. After it creates a project:
   - Click the service → **Settings**
   - Set **Root Directory** = `backend/RestaurantMenu.API`
   - Set **Builder** = Dockerfile (if asked)
5. Go to **Variables** and add:

```
ConnectionStrings__DefaultConnection = (Copy from Supabase → Settings → Database, or from your backend appsettings.json)
CORS_ORIGINS = https://restaurant-menu-app.vercel.app
ASPNETCORE_ENVIRONMENT = Production
```

6. Go to **Settings** → **Networking** → **Generate Domain**
7. **Copy your backend URL** (e.g. `https://xxx.up.railway.app`)
8. Add 2 more variables:
```
BaseUrl = https://YOUR-RAILWAY-URL
Frontend__BaseUrl = https://restaurant-menu-app.vercel.app
```
9. Redeploy (Deployments → … → Redeploy)

---

## Step 2: Deploy Frontend (Vercel) – 2 min

1. **Click here:** https://vercel.com/new/clone?repository-url=https://github.com/AhmadSulieman93/restaurant-menu-app
2. Sign in with GitHub if asked
3. Click **Import**
4. Before deploying, add **Environment Variables**:

| Name | Value |
|------|-------|
| NEXT_PUBLIC_API_URL | https://YOUR-RAILWAY-URL/api |
| NEXT_PUBLIC_APP_URL | https://restaurant-menu-app.vercel.app |

5. Click **Deploy**
6. Wait ~2 min → **You get your live URL!**

---

## Step 3: Update CORS (if your Vercel URL is different)

If Vercel gives you a different URL (e.g. `restaurant-menu-app-xxx.vercel.app`):
- Update Railway variables: `CORS_ORIGINS` and `Frontend__BaseUrl` to that URL
- Redeploy backend

---

## ✅ Your Live URLs

- **Frontend:** https://restaurant-menu-app.vercel.app (or whatever Vercel gives you)
- **Backend API:** https://your-railway-url.up.railway.app
- **Login:** https://your-app.vercel.app/login

**Demo login:** admin@restaurantmenu.com / Admin@123
