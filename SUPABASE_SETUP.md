# Supabase Setup Guide

Use this when you want to switch from Railway to Supabase (fast, no cold starts).

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a project
2. Wait for the project to be ready
3. Go to **Settings → API** and copy:
   - **Project URL** (e.g. `https://xxx.supabase.co`)
   - **service_role** key (Secret) – keep this private

## 2. Run the Schema

1. Go to **SQL Editor** in Supabase
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Run it

## 3. Create Storage Bucket

1. Go to **Storage** in Supabase
2. Click **New bucket**
3. Name it `images`
4. Set **Public bucket** to ON (so image URLs work)

## 4. Create First Admin User

1. Go to **Authentication → Users**
2. Click **Add user** → **Create new user**
3. Enter email and password (e.g. `admin@restaurantmenu.com` / `Admin@123`)

4. Copy the new user's **UID** (UUID)
5. Go to **SQL Editor** and run:

```sql
INSERT INTO public.user_roles (user_id, role) 
VALUES ('PASTE-USER-UID-HERE', 'SUPER_ADMIN');
```

## 5. Add Environment Variables

In Vercel (or `.env.local`):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_USE_SUPABASE` | `true` |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service_role key |

## 6. Install Package

```bash
npm install @supabase/supabase-js
```

## 7. Deploy

Push to GitHub – Vercel will deploy. The app will use Supabase instead of Railway.

---

## Optional: Migrate Data from Railway

If you have existing restaurants in Railway, export them and import into Supabase. You can use the Supabase SQL Editor or write a one-time migration script.
