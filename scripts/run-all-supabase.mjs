#!/usr/bin/env node
/**
 * All-in-one Supabase setup.
 * Run: npm run supabase:all
 *
 * You need (from Supabase Dashboard → Settings → API & Database):
 * 1. Project URL → NEXT_PUBLIC_SUPABASE_URL
 * 2. service_role key → SUPABASE_SERVICE_ROLE_KEY  
 * 3. Database password (Settings → Database) → for DB URL
 *
 * Set in PowerShell:
 *   $env:NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
 *   $env:SUPABASE_DB_PASSWORD="your-database-password"
 *
 * Or create .env.local with these 3 vars, then: node scripts/run-all-supabase.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createRequire } from "module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dbPassword = process.env.SUPABASE_DB_PASSWORD;
const dbUrl = process.env.SUPABASE_DB_URL;

if (!url || !key) {
  console.error("\n❌ Set these in .env.local or as env vars:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co");
  console.error("   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key\n");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function runMigration() {
  if (!dbUrl && !dbPassword) {
    console.log("\n⚠️  Skipping DB migration (no SUPABASE_DB_URL or SUPABASE_DB_PASSWORD).");
    console.log("   Run the SQL manually: Supabase → SQL Editor → paste supabase/migrations/001_initial_schema.sql");
    return false;
  }

  let connString = dbUrl;
  if (!connString && dbPassword) {
    const match = url.match(/https:\/\/([a-zA-Z0-9-]+)\.supabase\.co/);
    if (!match) {
      console.error("Could not parse project ref from URL");
      return false;
    }
    const ref = match[1];
    connString = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${ref}.supabase.co:5432/postgres`;
  }

  try {
    const { default: pg } = await import("pg");
    const client = new pg.Client({ connectionString: connString });
    await client.connect();
    const sql = readFileSync(join(__dirname, "../supabase/migrations/001_initial_schema.sql"), "utf8");
    await client.query(sql);
    await client.end();
    console.log("✓ Database migration complete");
    return true;
  } catch (e) {
    if (e.code === "MODULE_NOT_FOUND") {
      console.log("\n⚠️  Install pg: npm install pg");
      console.log("   Or run SQL manually in Supabase SQL Editor");
      return false;
    }
    console.error("Migration error:", e.message);
    return false;
  }
}

async function main() {
  console.log("\n🚀 Supabase setup starting...\n");

  const migrated = await runMigration();
  if (!migrated) {
    console.log("\n⏸️  After running the SQL manually, run this script again.");
    console.log("   Or continue - setup script will create bucket + user (tables must exist).\n");
    const readline = (await import("readline")).default;
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    await new Promise((r) => rl.question("Run SQL now, then press Enter to continue... ", r));
    rl.close();
  }

  console.log("\n2. Creating storage bucket...");
  const { error: bucketErr } = await supabase.storage.createBucket("images", { public: true });
  if (bucketErr && !bucketErr.message?.includes("already exists")) {
    console.error("   ❌", bucketErr.message);
  } else {
    console.log("   ✓ Bucket ready");
  }

  const email = process.env.ADMIN_EMAIL || "admin@restaurantmenu.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@123";

  console.log("\n3. Creating admin user:", email);
  const { data: userData, error: userErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (userErr) {
    if (userErr.message?.includes("already been registered")) {
      const { data: list } = await supabase.auth.admin.listUsers();
      const u = list?.users?.find((x) => x.email === email);
      if (u) {
        await supabase.from("user_roles").upsert({ user_id: u.id, role: "SUPER_ADMIN" }, { onConflict: "user_id" });
        console.log("   ✓ User exists, role updated");
      }
    } else {
      console.error("   ❌", userErr.message);
    }
  } else if (userData?.user) {
    await supabase.from("user_roles").insert({ user_id: userData.user.id, role: "SUPER_ADMIN" });
    console.log("   ✓ Admin created");
  }

  console.log("\n✅ Setup done!\n");
  console.log("4. Add to Vercel (Settings → Environment Variables):");
  console.log("   NEXT_PUBLIC_USE_SUPABASE = true");
  console.log("   NEXT_PUBLIC_SUPABASE_URL =", url);
  console.log("   SUPABASE_SERVICE_ROLE_KEY = (your key)\n");
  console.log("5. Redeploy in Vercel.\n");
  console.log("Login:", email, "/", password, "\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
