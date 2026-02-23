# Supabase Setup – Step by Step

You created the Supabase project. Follow these steps **in order**.

---

## Step 2: Run the Database Schema (SQL)

1. In Supabase, click **SQL Editor** in the left sidebar (database icon with `</>`).
2. Click **New query**.
3. Open `supabase/migrations/001_initial_schema.sql` in your project and copy all its contents.
4. Paste into the SQL Editor.
5. Click **Run** (or press Ctrl+Enter).
6. You should see: `Success. No rows returned`.

---

## Step 3 & 4: Run the Setup Script (Bucket + Admin User)

This script creates the storage bucket and admin user for you.

1. Open a terminal in the project folder.
2. Set your Supabase credentials (replace with your real values):
   - **Project URL**: Supabase → **Settings** → **API** → copy **Project URL**
   - **Service Role Key**: same page → copy **service_role** (under "Project API keys")

   **Windows (PowerShell):**
   ```powershell
   $env:NEXT_PUBLIC_SUPABASE_URL="https://YOUR-PROJECT-ID.supabase.co"
   $env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
   $env:ADMIN_EMAIL="ahmad_selwawe93@yahoo.com"
   $env:ADMIN_PASSWORD="Ahmad@123"
   node scripts/setup-supabase.mjs
   ```

   **Mac/Linux:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL="https://YOUR-PROJECT-ID.supabase.co" \
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here" \
   ADMIN_EMAIL="ahmad_selwawe93@yahoo.com" \
   ADMIN_PASSWORD="Ahmad@123" \
   node scripts/setup-supabase.mjs
   ```

3. You should see: `Setup complete!`

---

## Step 5: Add Environment Variables in Vercel

1. Go to [vercel.com](https://vercel.com) and open your project.
2. Click **Settings** → **Environment Variables**.
3. Add these (one by one):

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_USE_SUPABASE` | `true` |
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL (e.g. `https://xxx.supabase.co`) |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your service_role key |

4. Set each for **Production**, **Preview**, **Development**.
5. Click **Save**.

---

## Step 6: Redeploy

1. In Vercel, go to **Deployments**.
2. Click the three dots on the latest deployment.
3. Click **Redeploy** (or push a new commit to GitHub).

---

## Done

Open your app URL and log in with:
- **Email:** ahmad_selwawe93@yahoo.com  
- **Password:** Ahmad@123  

You can change this password later in Supabase → Authentication → Users.
