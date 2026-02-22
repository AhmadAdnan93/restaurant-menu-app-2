# Add Railway URL – 30 seconds

## Option A: Run this (fastest)

```powershell
cd c:\Projects\restaurant-menu-app
.\FIX_NOW.ps1 "https://YOUR-RAILWAY-URL.up.railway.app"
```
Replace `YOUR-RAILWAY-URL` with your actual Railway domain.

---

## Option B: Vercel dashboard

1. **Open:** https://vercel.com/ahmadadnan93s-projects/resturent-app/settings/environment-variables

2. **Add:**
   - Name: `BACKEND_API_URL`
   - Value: `https://YOUR-RAILWAY-URL.up.railway.app/api`
   - Environment: Production

3. **Redeploy:** Deployments → ⋮ → Redeploy

---

## Where to get your Railway URL

Railway dashboard → Your project → Click the service → **Settings** → **Networking** → **Generate Domain** (if needed) → Copy the URL

It looks like: `https://restaurant-menu-app-production-xxxx.up.railway.app`
