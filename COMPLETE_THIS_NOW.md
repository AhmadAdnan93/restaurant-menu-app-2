# Complete Login – Copy & Paste This

Railway page should be open. **Follow exactly:**

---

## Railway – Step by Step

### 1. Sign in with GitHub (if needed)

### 2. After project is created, click the service (the box)

### 3. Settings → Root Directory
Type: `backend/RestaurantMenu.API`

### 4. Variables → Add each (Name + Value):

**Variable 1**
```
ConnectionStrings__DefaultConnection
Host=aws-1-ap-southeast-1.pooler.supabase.com;Port=6543;Database=postgres;Username=postgres.bxaapyvtgsfjieiacgqj;Password=A@ssd!123ahmad;SSL Mode=Require;Trust Server Certificate=true;
```

**Variable 2**
```
ASPNETCORE_ENVIRONMENT
Production
```

**Variable 3**
```
CORS_ORIGINS
https://resturent-app-taupe.vercel.app
```

### 5. Settings → Networking → Generate Domain

### 6. Copy your Railway URL** (e.g. `https://restaurant-menu-app-production-xxxx.up.railway.app`)

### 7. Add 2 more variables (use YOUR Railway URL from step 6):

**Variable 4**
```
BaseUrl
https://[PASTE-YOUR-RAILWAY-URL-HERE]
```

**Variable 5**
```
Frontend__BaseUrl
https://resturent-app-taupe.vercel.app
```

### 8. Redeploy: Deployments tab → ⋮ → Redeploy

---

## Vercel – After Railway is Running

### 1. Go to: https://vercel.com/ahmadadnan93s-projects/resturent-app/settings/environment-variables

### 2. Add this variable (ONE is enough):

**Name:** `BACKEND_API_URL`  
**Value:** `https://YOUR-RAILWAY-URL/api`  
*(Replace with your Railway URL from step 6 above)*

### 3. Save → Go to Deployments → ⋮ → Redeploy

---

## Done!

Login at: https://resturent-app-taupe.vercel.app/login  
Credentials: admin@restaurantmenu.com / Admin@123
