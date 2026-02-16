# ✅ COMPLETE DEPLOYMENT – Copy & Paste Everything

**Follow this exact order. Copy the values below into each platform.**

---

## PART 1: Vercel (Frontend) – RIGHT NOW

You're on the Vercel "Add Environment Variables" page. **Fill these exactly:**

### Name: `NEXT_PUBLIC_API_URL`  
### Value:
```
http://localhost:5000/api
```
*(Temporary – after Part 2, update this in Vercel Settings to your Railway URL + /api, then Redeploy)*

### Name: `NEXT_PUBLIC_APP_URL`  
### Value:
```
https://restaurant-menu-app.vercel.app
```

**→ Click DEPLOY**

After deploy completes, note your actual Vercel URL (may be `restaurant-menu-app-xxxx.vercel.app`). You'll need it for Railway.

---

## PART 2: Railway (Backend)

**1. Open:** https://railway.app/new?repository=https://github.com/AhmadSulieman93/restaurant-menu-app

**2. Sign in with GitHub**

**3. Click the service → Settings:**
- **Root Directory:** `backend/RestaurantMenu.API`

**4. Variables → Add these (copy each VALUE exactly):**

| Name | Value |
|------|-------|
| `ConnectionStrings__DefaultConnection` | `Host=aws-1-ap-southeast-1.pooler.supabase.com;Port=6543;Database=postgres;Username=postgres.bxaapyvtgsfjieiacgqj;Password=A@ssd!123ahmad;SSL Mode=Require;Trust Server Certificate=true;` |
| `ASPNETCORE_ENVIRONMENT` | `Production` |

**5. Settings → Networking → Generate Domain**

**6. Copy your Railway URL** (e.g. `https://restaurantmenuapp-production-xxxx.up.railway.app`)

**7. Add 2 more variables** (replace with YOUR actual URLs):

| Name | Value |
|------|-------|
| `CORS_ORIGINS` | `https://restaurant-menu-app.vercel.app` |
| `BaseUrl` | `https://YOUR-RAILWAY-URL` *(paste the URL from step 6)* |
| `Frontend__BaseUrl` | `https://restaurant-menu-app.vercel.app` |

**8. Deployments → ⋮ → Redeploy**

---

## PART 3: Update Vercel (Connect to Backend)

**1. Vercel → Your Project → Settings → Environment Variables**

**2. Edit `NEXT_PUBLIC_API_URL`** – replace with:
```
https://YOUR-RAILWAY-URL/api
```
*(Use the Railway URL from Part 2, step 6)*

**3. If your Vercel URL is different** (e.g. `restaurant-menu-app-abc123.vercel.app`), also update:
- `NEXT_PUBLIC_APP_URL` to that URL

**4. Save → Deployments → ⋮ → Redeploy**

---

## ✅ DONE

- **App:** https://restaurant-menu-app.vercel.app (or your Vercel URL)
- **Login:** https://restaurant-menu-app.vercel.app/login
- **Demo:** admin@restaurantmenu.com / Admin@123
