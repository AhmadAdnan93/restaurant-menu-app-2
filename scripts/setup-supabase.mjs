#!/usr/bin/env node
/**
 * Supabase Setup Script
 * Run after creating Supabase project and running the SQL migration.
 *
 * Usage:
 *   set NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
 *   set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 *   set ADMIN_EMAIL=ahmad_selwawe93@yahoo.com
 *   set ADMIN_PASSWORD=Ahmad@123
 *   node scripts/setup-supabase.mjs
 *
 * Or on Linux/Mac:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/setup-supabase.mjs
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL || "ahmad_selwawe93@yahoo.com";
const password = process.env.ADMIN_PASSWORD || "Ahmad@123";

if (!url || !key) {
  console.error("\n❌ Missing env vars. Set these first:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co");
  console.error("   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key");
  console.error("\nOptional:");
  console.error("   ADMIN_EMAIL=ahmad_selwawe93@yahoo.com");
  console.error("   ADMIN_PASSWORD=Ahmad@123");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  console.log("\n🚀 Supabase setup starting...\n");

  // 0. Check that SQL migration was run
  const { error: checkErr } = await supabase.from("user_roles").select("id").limit(1);
  if (checkErr) {
    console.error("❌ Tables not found. Run the SQL migration first!");
    console.error("   Go to Supabase → SQL Editor → New query");
    console.error("   Copy supabase/migrations/001_initial_schema.sql and run it.\n");
    process.exit(1);
  }

  // 1. Create storage bucket
  console.log("1. Creating 'images' storage bucket...");
  const { error: bucketErr } = await supabase.storage.createBucket("images", { public: true });
  if (bucketErr) {
    if (bucketErr.message?.includes("already exists")) {
      console.log("   ✓ Bucket already exists");
    } else {
      console.error("   ❌", bucketErr.message);
      process.exit(1);
    }
  } else {
    console.log("   ✓ Bucket created");
  }

  // 2. Create admin user
  console.log("\n2. Creating admin user:", email);
  const { data: userData, error: userErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: "ahmadadnan93" },
  });
  if (userErr) {
    if (userErr.message?.includes("already been registered")) {
      console.log("   ℹ User exists - fetching...");
      const { data: users } = await supabase.auth.admin.listUsers();
      const existing = users?.users?.find((u) => u.email === email);
      if (!existing) {
        console.error("   ❌ Could not find existing user");
        process.exit(1);
      }
      await addRole(existing.id);
    } else {
      console.error("   ❌", userErr.message);
      process.exit(1);
    }
  } else if (userData?.user) {
    console.log("   ✓ User created");
    await addRole(userData.user.id);
  }
  console.log("\n✅ Setup complete!\n");
  console.log("Next: Add these to Vercel → Project → Settings → Environment Variables:");
  console.log("   NEXT_PUBLIC_USE_SUPABASE = true");
  console.log("   NEXT_PUBLIC_SUPABASE_URL =", url);
  console.log("   SUPABASE_SERVICE_ROLE_KEY = (your key)\n");
}

async function addRole(userId) {
  console.log("3. Adding SUPER_ADMIN role...");
  const { error } = await supabase.from("user_roles").upsert(
    { user_id: userId, role: "SUPER_ADMIN" },
    { onConflict: "user_id" }
  );
  if (error) {
    console.error("   ❌", error.message);
    process.exit(1);
  }
  console.log("   ✓ Role added");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
