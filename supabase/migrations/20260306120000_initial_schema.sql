create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  role text not null check (role in ('Admin', 'Leader', 'Member')),
  phone text,
  avatar text
);

create table if not exists public.ministries (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  leader_id uuid references public.profiles (id) on delete set null
);

create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  ministry_id uuid not null references public.ministries (id) on delete cascade,
  member_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  status text not null default 'Pending' check (status in ('Pending', 'Confirmed', 'Declined')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (member_id, date)
);

create table if not exists public.daycare_checkins (
  id uuid primary key default gen_random_uuid(),
  child_name text not null,
  parent_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'Out' check (status in ('In', 'Out')),
  security_token text not null,
  checkin_time timestamptz not null default timezone('utc', now())
);

create table if not exists public.notification_jobs (
  id bigint generated always as identity primary key,
  schedule_id uuid not null references public.schedules (id) on delete cascade,
  member_id uuid not null references public.profiles (id) on delete cascade,
  ministry_id uuid not null references public.ministries (id) on delete cascade,
  scheduled_for timestamptz not null,
  delivery_channel text not null default 'expo_push',
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued', 'processing', 'sent', 'failed')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists schedules_date_idx on public.schedules (date);
create index if not exists daycare_checkins_parent_id_idx on public.daycare_checkins (parent_id);
create index if not exists notification_jobs_scheduled_for_idx on public.notification_jobs (scheduled_for);

alter table public.profiles enable row level security;
alter table public.ministries enable row level security;
alter table public.schedules enable row level security;
alter table public.daycare_checkins enable row level security;
alter table public.notification_jobs enable row level security;

create policy "Authenticated users can read profiles"
on public.profiles
for select
to authenticated
using (true);

create policy "Authenticated users can read ministries"
on public.ministries
for select
to authenticated
using (true);

create policy "Authenticated users can read schedules"
on public.schedules
for select
to authenticated
using (true);

create policy "Authenticated users can create schedules"
on public.schedules
for insert
to authenticated
with check (true);

create policy "Authenticated users can update schedules"
on public.schedules
for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can read daycare checkins"
on public.daycare_checkins
for select
to authenticated
using (true);

create policy "Authenticated users can create daycare checkins"
on public.daycare_checkins
for insert
to authenticated
with check (true);

create policy "Service role manages notification jobs"
on public.notification_jobs
for all
to service_role
using (true)
with check (true);
