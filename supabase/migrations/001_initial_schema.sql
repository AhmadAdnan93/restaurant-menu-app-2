-- Restaurant Menu App - Supabase Schema
-- Run this in Supabase SQL Editor or via: supabase db push

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- User roles (links to Supabase Auth)
create table if not exists public.user_roles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade unique,
  role text not null check (role in ('SUPER_ADMIN', 'RESTAURANT_OWNER', 'CUSTOMER')),
  restaurant_id uuid,
  created_at timestamptz default now()
);

-- Restaurants
create table if not exists public.restaurants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  logo text,
  cover_image text,
  description text,
  status text default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED')),
  phone text,
  email text,
  website text,
  address text,
  city text,
  country text,
  qr_code text default encode(gen_random_bytes(16), 'hex'),
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Categories
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  description text,
  "order" int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Menu items
create table if not exists public.menu_items (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  description text not null,
  price decimal(10,2) not null,
  image text,
  "order" int default 0,
  is_available boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ratings (optional)
create table if not exists public.ratings (
  id uuid primary key default uuid_generate_v4(),
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  value int not null check (value >= 1 and value <= 5),
  comment text,
  customer_id text,
  customer_name text,
  created_at timestamptz default now()
);

-- Indexes for fast lookups
create index if not exists idx_restaurants_slug on public.restaurants(slug);
create index if not exists idx_restaurants_is_published on public.restaurants(is_published);
create index if not exists idx_categories_restaurant on public.categories(restaurant_id);
create index if not exists idx_menu_items_category on public.menu_items(category_id);
create index if not exists idx_user_roles_user_id on public.user_roles(user_id);

-- RLS (Row Level Security) - allow public read for published restaurants
alter table public.restaurants enable row level security;
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.user_roles enable row level security;
alter table public.ratings enable row level security;

-- Public can read published restaurants and their data
create policy "Public read published restaurants" on public.restaurants
  for select using (is_published = true);

create policy "Public read categories of published restaurants" on public.categories
  for select using (
    exists (select 1 from public.restaurants r where r.id = restaurant_id and r.is_published = true)
  );

create policy "Public read menu items of active categories" on public.menu_items
  for select using (
    exists (
      select 1 from public.categories c
      join public.restaurants r on r.id = c.restaurant_id
      where c.id = category_id and c.is_active and r.is_published
    )
  );

-- Service role bypasses RLS (used by API routes with service key)
-- Authenticated users with SUPER_ADMIN or RESTAURANT_OWNER can do full CRUD via API
