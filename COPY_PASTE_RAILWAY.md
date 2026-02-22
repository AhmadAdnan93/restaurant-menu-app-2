# Railway – Copy & Paste (2 mins)

## 1. Open
https://railway.app/new?repository=https://github.com/AhmadSulieman93/restaurant-menu-app

## 2. Sign in with GitHub (if needed)

## 3. Click the service (the box) → Settings

### Root Directory
```
backend/RestaurantMenu.API
```

## 4. Variables tab – Add these (Name = left, Value = right)

| Name | Value |
|------|-------|
| `ConnectionStrings__DefaultConnection` | `Host=aws-1-ap-southeast-1.pooler.supabase.com;Port=6543;Database=postgres;Username=postgres.bxaapyvtgsfjieiacgqj;Password=A@ssd!123ahmad;SSL Mode=Require;Trust Server Certificate=true;` |
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `CORS_ORIGINS` | `https://resturent-app-taupe.vercel.app` |

## 5. Settings → Networking → Generate Domain

## 6. Copy your Railway URL
(e.g. `https://restaurant-menu-app-production-xxxx.up.railway.app`)

## 7. Variables – Add 2 more (use YOUR URL from step 6)

| Name | Value |
|------|-------|
| `BaseUrl` | `https://YOUR-RAILWAY-URL` (paste yours) |
| `Frontend__BaseUrl` | `https://resturent-app-taupe.vercel.app` |

## 8. Deployments tab → ⋮ (three dots) → Redeploy

## 9. Go to Cursor terminal
Paste your Railway URL when prompted → Enter

## 10. Test
https://resturent-app-taupe.vercel.app/login  
admin@restaurantmenu.com / Admin@123
