# Live Full-Scenario Test

Run this on **https://resturent-app-taupe.vercel.app** to verify everything works.

## Performance Targets
- **Admin panel load:** < 2 sec (cached or warm backend)
- **Manage restaurant:** Instant header from admin list, full data loads in background

---

## Steps

### 1. Login
- Go to `/login`
- Use: `admin@restaurantmenu.com` / `Admin@123`
- Should redirect to admin quickly

### 2. Admin Panel
- Restaurants should appear **immediately** (from cache on repeat visit, or within 2 sec)
- If slow: "Wake backend & Retry" button appears after ~12s – click it

### 3. Add Restaurant (from scratch)
- Click **Add Restaurant**
- Fill: Name, Slug
- **Upload logo** (optional) and **cover image** (optional)
- Click **Create Restaurant**
- Should redirect to manage page

### 4. Add Category
- On manage page, click **Add Category**
- Enter name, description, order
- Submit

### 5. Add Menu Item with Image
- Click **Add Item** on the category
- Fill: Name, Description, Price
- **Upload an image** (required for full test)
- Submit

### 6. View Public Menu
- Go back to Admin, click **View Menu** on the restaurant
- Or open `/menu/your-slug`
- Confirm all data and images show correctly

---

## If Backend Is Cold
- First load after inactivity can take 30–60s
- Use **Wake backend & Retry** or wait and retry
- Repeat visits use cache for instant load
