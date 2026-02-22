-- Run this in Supabase SQL Editor if the EF migration doesn't apply automatically.
-- This allows SUPER_ADMIN to own multiple restaurants.

-- Drop the unique constraint on UserId (PostgreSQL)
DROP INDEX IF EXISTS "IX_RestaurantOwners_UserId";

-- Recreate as non-unique index for lookups
CREATE INDEX IF NOT EXISTS "IX_RestaurantOwners_UserId" ON "RestaurantOwners" ("UserId");
