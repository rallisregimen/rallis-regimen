-- ============================================================
-- RALLIS REGIMEN — SUPABASE SCHEMA
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES — extends Supabase auth.users
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  stripe_customer_id text,
  subscription_status text default 'inactive', -- inactive | active | cancelled | past_due
  subscription_tier text default 'monthly',    -- monthly | annual
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- INTAKE SUBMISSIONS — one per member, updated monthly
-- ============================================================
create table public.intake_submissions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,

  -- SECTION 1: About You
  first_name text,
  age integer,
  sex text,                    -- male | female | other
  height_ft integer,
  height_in integer,
  current_weight_lbs numeric,
  ideal_weight_lbs numeric,

  -- SECTION 2: Goals (forced priority)
  goal_primary text,           -- build_muscle | build_strength | lose_fat | athletic_performance | conditioning | general_health
  goal_secondary text,

  -- SECTION 3: Training
  experience_level text,       -- beginner | intermediate | advanced
  training_days_per_week integer,
  session_length_mins integer, -- 30 | 45 | 60 | 90 | 120
  equipment text,              -- full_gym | dumbbells_only | home_bands | bodyweight_only
  injuries_limitations text,   -- free text, nullable

  -- SECTION 4: Nutrition
  weight_management_goal text, -- bulk | cut | maintain
  dietary_restrictions text[], -- array of strings
  foods_to_avoid text,         -- free text, nullable
  nutrition_approach text,     -- macro_tracking | fist_portions

  -- SECTION 5: Sleep
  avg_sleep_hours numeric,
  sleep_issue text,            -- none | falling_asleep | staying_asleep | both
  typical_bedtime text,        -- e.g. "10:30 PM"
  typical_wake_time text,
  caffeine_after_noon boolean,
  phone_in_bedroom boolean,

  -- SECTION 6: Environment (quick yes/no audit)
  filters_water boolean,
  morning_sunlight boolean,
  nonstick_cookware boolean,
  conventional_cleaning boolean,
  phone_in_bedroom_sleeping boolean,

  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Only one intake per user (upsert pattern)
create unique index intake_submissions_user_id_idx on public.intake_submissions(user_id);

-- ============================================================
-- GENERATED PROGRAMS — one generated per billing cycle
-- ============================================================
create table public.generated_programs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  intake_id uuid references public.intake_submissions(id),

  -- Program metadata
  program_name text,
  program_type text,           -- hypertrophy | strength | conditioning | home | beginner
  block_number integer default 1,
  generation_month text,       -- e.g. "2026-03"

  -- Generated content (stored as JSON for flexibility)
  write_up jsonb,              -- intro, goals, approach
  training_program jsonb,      -- full week/day/exercise structure
  meal_plan jsonb,             -- meals, macros, calorie targets
  sleep_protocol jsonb,        -- morning, evening, sleep conditions
  environment_audit jsonb,     -- prioritized action list

  -- Delivery
  pdf_url text,                -- link to generated PDF in Supabase storage
  docx_url text,

  generated_at timestamptz default now(),
  status text default 'generating' -- generating | ready | failed
);

-- ============================================================
-- ROW LEVEL SECURITY — users only see their own data
-- ============================================================
alter table public.profiles enable row level security;
alter table public.intake_submissions enable row level security;
alter table public.generated_programs enable row level security;

-- Profiles
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Intake
create policy "Users can view own intake"
  on public.intake_submissions for select using (auth.uid() = user_id);
create policy "Users can insert own intake"
  on public.intake_submissions for insert with check (auth.uid() = user_id);
create policy "Users can update own intake"
  on public.intake_submissions for update using (auth.uid() = user_id);

-- Programs
create policy "Users can view own programs"
  on public.generated_programs for select using (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKET for generated PDFs
-- ============================================================
insert into storage.buckets (id, name, public)
values ('programs', 'programs', false);

create policy "Users can access own program files"
  on storage.objects for select
  using (bucket_id = 'programs' and auth.uid()::text = (storage.foldername(name))[1]);
