# 🚀 Deploy Your Restaurant Menu App – Step by Step

This guide walks you through deploying both the **Backend** (.NET API) and **Frontend** (Next.js) to make your app live.

---

## 📋 What You Need

- [ ] **GitHub account** – to push your code
- [ ] **Supabase project** – database (you already have this)
- [ ] **Railway account** – free tier for backend (https://railway.app)
- [ ] **Vercel account** – free tier for frontend (https://vercel.com)

---

## Step 1: Push Code to GitHub

1. Create a new repository on GitHub (if you haven’t already).

2. Push your project:

   ```bash
   cd c:\Projects\restaurant-menu-app
   git add .
   git commit -m "Prepare for deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub details.

---

## Step 2: Deploy Backend to Railway

### 2.1 Create Railway Project

1. Go to **https://railway.app** and sign in with GitHub.
2. Click **New Project**.
3. Choose **Deploy from GitHub repo**.
4. Select your `restaurant-menu-app` repository.
5. Railway will show a list of services. **Do not deploy yet** – we’ll configure first.

### 2.2 Configure Backend Service

1. Click on the service that was created.
2. Go to **Settings**:
   - **Root Directory**: set to `backend/RestaurantMenu.API`
   - **Builder**: choose **Dockerfile** (or leave auto – Railway will detect the Dockerfile)
3. Go to **Variables** and add:

   | Variable | Value |
   |----------|--------|
   | `ConnectionStrings__DefaultConnection` | Your Supabase connection string (from Supabase Dashboard → Settings → Database) |
   | `CORS_ORIGINS` | `https://your-app.vercel.app` (you’ll update this after deploying the frontend) |
   | `BaseUrl` | `https://YOUR-RAILWAY-URL.up.railway.app` (you’ll set this after the first deploy) |
   | `Frontend__BaseUrl` | `https://your-app.vercel.app` (same as CORS for now) |
   | `ASPNETCORE_ENVIRONMENT` | `Production` |

4. For the **connection string**, use your Supabase connection string:
   - Supabase Dashboard → Settings → Database → Connection string.
   - Use the **Connection pooling** (Transaction) format with port `6543`, or the direct connection string.

### 2.3 Deploy and Get Backend URL

1. Click **Deploy** (or let Railway auto-deploy after your first push).
2. After it finishes, go to **Settings** → **Networking** → **Generate Domain**.
3. Copy the URL, e.g. `https://restaurant-menu-api-production-xxxx.up.railway.app`.

4. Update your variables:
   - `BaseUrl` → your Railway URL (e.g. `https://restaurant-menu-api-production-xxxx.up.railway.app`)
   - `CORS_ORIGINS` → will be updated after frontend deploy.

5. Redeploy if you changed variables.

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Project

1. Go to **https://vercel.com** and sign in with GitHub.
2. Click **Add New** → **Project**.
3. Import your `restaurant-menu-app` repository.
4. Vercel will detect Next.js automatically.

### 3.2 Set Environment Variables

Before deploying, add these in **Settings** → **Environment Variables**:

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-RAILWAY-URL.up.railway.app/api` (your backend URL + `/api`) |
| `NEXT_PUBLIC_APP_URL` | `https://YOUR-VERCEL-URL.vercel.app` (use your Vercel URL after first deploy, or your custom domain) |

### 3.3 Deploy

1. Click **Deploy**.
2. Wait for the build to finish.
3. Copy your live URL, e.g. `https://restaurant-menu-app.vercel.app`.

### 3.4 Wire Backend and Frontend

1. In **Railway**, update:
   - `CORS_ORIGINS` → `https://restaurant-menu-app.vercel.app` (your Vercel URL)
   - `Frontend__BaseUrl` → `https://restaurant-menu-app.vercel.app`
2. Redeploy the backend so CORS picks up the new value.
3. In **Vercel**, set `NEXT_PUBLIC_APP_URL` to your final frontend URL (for QR codes) if it changed.
4. Trigger a redeploy of the frontend.

---

## Step 4: Verify Everything Works

1. **Frontend:**  
   Open `https://your-app.vercel.app`

2. **Login:**  
   Go to `/login` and sign in with:
   - Email: `admin@restaurantmenu.com`  
   - Password: `Admin@123`

3. **QR codes:**  
   Open a restaurant menu page and check that the QR code uses your production URL.

4. **Restaurants:**  
   Create a restaurant, add categories and menu items, and confirm images upload correctly.

---

## Environment Variables Summary

### Backend (Railway)

| Variable | Description | Example |
|----------|-------------|---------|
| `ConnectionStrings__DefaultConnection` | Supabase PostgreSQL connection string | `Host=...;Port=6543;Database=postgres;Username=...;Password=...;SSL Mode=Require` |
| `CORS_ORIGINS` | Comma-separated frontend URLs | `https://restaurant-menu-app.vercel.app` |
| `BaseUrl` | Your Railway backend URL | `https://xxx.up.railway.app` |
| `Frontend__BaseUrl` | Same as your main frontend URL | `https://restaurant-menu-app.vercel.app` |
| `ASPNETCORE_ENVIRONMENT` | Use `Production` in prod | `Production` |

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://xxx.up.railway.app/api` |
| `NEXT_PUBLIC_APP_URL` | Public app URL for QR codes | `https://restaurant-menu-app.vercel.app` |

---

## Notes

- **Images:** Uploaded images are stored on the backend. On Railway’s free tier, storage is ephemeral, so images may be lost when the service restarts. For persistent storage, consider moving uploads to Supabase Storage later.
- **Supabase:** Ensure your project is running and not paused, or the backend will fail to connect.
- **Custom domain:** You can add custom domains in both Vercel and Railway. After that, update `NEXT_PUBLIC_APP_URL`, `CORS_ORIGINS`, and `Frontend__BaseUrl` accordingly.
