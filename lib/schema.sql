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
  country_code text,
  created_by text not null,
  created_at timestamptz default now()
);

-- Country document templates (requirements per destination)
create table if not exists country_document_templates (
  id uuid primary key default gen_random_uuid(),
  country_code text not null,
  doc_name text not null,
  days_before_departure int not null,
  description text,
  "order" int default 0,
  created_at timestamptz default now()
);

-- Trip documents (checklist items per trip)
create table if not exists trip_documents (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  template_id uuid references country_document_templates(id) on delete set null,
  name text not null,
  status text not null default 'pending' check (status in ('done', 'pending', 'urgent', 'na')),
  deadline date,
  note text,
  "order" int default 0,
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

-- Photos (Supabase Storage)
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade,
  storage_path text not null,
  url text not null,
  thumbnail_url text,
  caption text,
  tags text[],
  created_by text not null,
  created_at timestamptz default now()
);

-- Treatment cases (episode of treatment: diagnosis, dates)
create table if not exists treatment_cases (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade,
  title text not null,
  diagnosis text,
  start_date date not null,
  end_date date,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  vet_event_id uuid references events(id) on delete set null,
  created_by text not null,
  created_at timestamptz default now()
);

-- Medications (within a treatment case)
create table if not exists medications (
  id uuid primary key default gen_random_uuid(),
  treatment_case_id uuid references treatment_cases(id) on delete cascade,
  name text not null,
  dosage text,
  form text check (form in ('oral', 'drops', 'ointment', 'injection', 'other')),
  frequency text not null,
  start_date date not null,
  end_date date,
  instructions text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Procedures (non-pill treatments: ear drops, shampoo, etc.)
create table if not exists procedures (
  id uuid primary key default gen_random_uuid(),
  treatment_case_id uuid references treatment_cases(id) on delete cascade,
  name text not null,
  description text,
  frequency text not null,
  duration_minutes int,
  instructions text,
  start_date date not null,
  end_date date,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Treatment steps (e.g. Осмотр, Капли 7 дней, Контрольный визит)
create table if not exists treatment_steps (
  id uuid primary key default gen_random_uuid(),
  treatment_case_id uuid references treatment_cases(id) on delete cascade,
  label text not null,
  done boolean default false,
  due_date date,
  "order" int default 0,
  created_at timestamptz default now()
);

-- Medication doses (for "taken" tracking)
create table if not exists medication_doses (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid references medications(id) on delete cascade,
  scheduled_at timestamptz not null,
  taken_at timestamptz,
  taken_by text,
  created_at timestamptz default now()
);

-- Bot chats (for daily digest)
create table if not exists bot_chats (
  chat_id bigint primary key,
  chat_type text not null default 'private',
  title text,
  user_name text,
  pet_id uuid references pets(id) on delete set null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================
-- Demo data for testing
-- ============================================
INSERT INTO pets (id, name, breed, owner_id)
VALUES ('003ab934-9f93-4f2b-aade-10a6fbc8ca40', 'Demo Pet', 'Mixed', 'demo-user')
ON CONFLICT (id) DO NOTHING;

-- Country document templates (EU, UK, GE)
INSERT INTO country_document_templates (country_code, doc_name, days_before_departure, description, "order") VALUES
  ('EU', 'Микрочип (ISO 11784)', 0, 'Обязателен для ввоза в ЕС', 1),
  ('EU', 'Ветпаспорт международный', 0, null, 2),
  ('EU', 'Прививка от бешенства', 0, 'Не ранее 21 дня до выезда', 3),
  ('EU', 'Титры антител', 30, 'Анализ крови, не ранее 30 дней до выезда', 4),
  ('EU', 'Комплексная прививка (DHPP)', 0, null, 5),
  ('EU', 'Обработка от глистов', 5, 'За 1-5 дней до выезда', 6),
  ('EU', 'Ветсвидетельство Ф1', 5, 'Не ранее 5 дней до выезда', 7),
  ('UK', 'Микрочип (ISO 11784)', 0, null, 1),
  ('UK', 'Ветпаспорт международный', 0, null, 2),
  ('UK', 'Прививка от бешенства', 0, null, 3),
  ('UK', 'Титры антител', 30, null, 4),
  ('UK', 'Обработка от глистов', 5, null, 5),
  ('UK', 'Ветсвидетельство UK', 10, 'Специальная форма для UK', 6),
  ('GE', 'Ветпаспорт', 0, null, 1),
  ('GE', 'Прививка от бешенства', 0, null, 2),
  ('RU', 'Ветпаспорт', 0, null, 1),
  ('RU', 'Прививка от бешенства', 0, null, 2),
  ('RU', 'Ветсвидетельство Ф1', 5, null, 3);
