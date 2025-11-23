# Quick Setup Guide

## Step 1: Install Dependencies

```bash
cd C:\Projects\restaurant-menu-app
npm install
```

## Step 2: Set Up Database

### Option A: SQLite (Easiest for Local Development)

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```

2. Run:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### Option B: PostgreSQL (Recommended for Production)

1. Create a PostgreSQL database (use Supabase, Neon, or Railway for free tier)

2. Create `.env.local`:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
   NEXT_PUBLIC_URL="http://localhost:3000"
   ```

3. Run:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## Step 3: Run Development Server

```bash
npm run dev
```

## Step 4: Access the Application

- **Home Page**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Restaurants List**: http://localhost:3000/restaurants

## Step 5: Create Your First Restaurant

1. Go to http://localhost:3000/admin
2. Click "Add Restaurant"
3. Fill in the details:
   - Name: Your restaurant name
   - Slug: URL-friendly name (e.g., "my-restaurant")
   - Logo URL: (optional) Image URL
   - Description: (optional)
4. Click "Create Restaurant"

## Step 6: Add Categories and Menu Items

1. Click "Manage" on your restaurant
2. Click "Add Category" to create menu categories
3. Click "Add Item" in each category to add menu items
4. Fill in:
   - Name
   - Description
   - Price
   - Image URL (optional)
   - Order (for sorting)

## Step 7: View Your Menu

1. Click "View Menu" on your restaurant card
2. Or visit: http://localhost:3000/menu/your-slug
3. Scan the QR code to test on mobile!

## Features Included

✅ Multi-restaurant support
✅ QR code generation for each restaurant
✅ Category management
✅ Menu item management with images
✅ Rating system for dishes
✅ Image slider for menu items
✅ Fully responsive design (mobile, tablet, desktop)
✅ Server-side rendering (SSR)
✅ Image lazy-loading
✅ Modern, beautiful UI

## Next Steps

- Deploy to production (see DEPLOYMENT.md)
- Add authentication for admin panel
- Add image upload functionality
- Customize colors and branding

