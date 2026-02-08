-- ============================================
-- GoBoop — Database Schema
-- ============================================
-- Run this in Supabase SQL Editor:
-- supabase.com > your project > SQL Editor > New query > paste & run
-- ============================================

-- Pets
create table if not exists pets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  breed text,
  birth_date date,
  photo_url text,
  owner_id text not null,
  created_at timestamptz default now()
);

-- Events (vet visits, trips, grooming)
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade,
  type text not null check (type in ('vet', 'trip', 'grooming', 'other')),
  title text not null,
  description text,
  date date not null,
  time time,
  location text,
  created_by text not null,
  created_at timestamptz default now()
);

-- Tasks (family tasks with XP)
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'pending' check (status in ('pending', 'done', 'overdue')),
  assigned_to text,
  due_date date,
  xp_reward int default 10,
  created_by text not null,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Weight records
create table if not exists weight_records (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade,
  weight_kg numeric(5,2) not null,
  recorded_at timestamptz default now(),
  created_by text not null
);

-- Notes
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade,
  content text not null,
  created_by text not null,
  created_at timestamptz default now()
);

-- Shopping items
create table if not exists shopping_items (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade,
  title text not null,
  price numeric(10,2),
  status text not null default 'pending' check (status in ('pending', 'bought')),
  created_by text not null,
  created_at timestamptz default now(),
  bought_at timestamptz
);

-- Reminders
create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade,
  content text not null,
  remind_at timestamptz not null,
  is_sent boolean default false,
  created_by text not null,
  created_at timestamptz default now()
);

-- Feedback (for hypothesis testing)
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now()
);

-- Photos (Google Drive links)
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade,
  drive_file_id text unique,
  web_view_link text,
  thumbnail_link text,
  tags text[],
  created_by text not null,
  created_at timestamptz default now()
);

-- ============================================
-- Demo data for testing
-- ============================================
INSERT INTO pets (id, name, breed, owner_id)
VALUES ('003ab934-9f93-4f2b-aade-10a6fbc8ca40', 'Demo Pet', 'Mixed', 'demo-user')
ON CONFLICT (id) DO NOTHING;
