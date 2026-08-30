-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/zaxfqfmrhntqipseoeaa/sql
-- Creates tables per api-data-contract.md exactly

-- Enable UUID extension if not exists
create extension if not exists "pgcrypto";

-- resumes
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  original_filename text not null,
  uploaded_at timestamp with time zone default now() not null,
  raw_extraction_status text check (raw_extraction_status in ('pending','ok','error')) not null default 'pending',
  raw_extraction_confidence float check (raw_extraction_confidence >=0 and raw_extraction_confidence <=1)
);

-- portfolio_data
create table if not exists public.portfolio_data (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid references public.resumes(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  schema_data jsonb not null,
  updated_at timestamp with time zone default now() not null
);

-- portfolios
create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  portfolio_data_id uuid references public.portfolio_data(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  slug text unique not null,
  style_preset text check (style_preset in ('minimal','glass','bold','soft','dark_pro','classic','grid','retro')) not null,
  published boolean not null default false,
  published_at timestamp with time zone
);

-- change_requests
create table if not exists public.change_requests (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid references public.portfolios(id) on delete cascade not null,
  request_text text not null,
  target_section text not null,
  status text check (status in ('pending','applied','failed')) not null default 'pending',
  created_at timestamp with time zone default now() not null
);

-- RLS enable
alter table public.resumes enable row level security;
alter table public.portfolio_data enable row level security;
alter table public.portfolios enable row level security;
alter table public.change_requests enable row level security;

-- Policies: users can only access their own rows; public can read published portfolios + their portfolio_data
-- DROP if rerun
drop policy if exists "Users manage own resumes" on public.resumes;
create policy "Users manage own resumes" on public.resumes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own portfolio_data" on public.portfolio_data;
create policy "Users manage own portfolio_data" on public.portfolio_data for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Public can read published portfolios" on public.portfolios;
create policy "Public can read published portfolios" on public.portfolios for select using (published = true);

drop policy if exists "Users manage own portfolios" on public.portfolios;
create policy "Users manage own portfolios" on public.portfolios for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own change_requests" on public.change_requests;
create policy "Users manage own change_requests" on public.change_requests for all using (
  exists (select 1 from public.portfolios p where p.id = portfolio_id and p.user_id = auth.uid())
) with check (
  exists (select 1 from public.portfolios p where p.id = portfolio_id and p.user_id = auth.uid())
);

-- Storage bucket for resumes
insert into storage.buckets (id, name, public) values ('resumes', 'resumes', false)
on conflict (id) do nothing;

drop policy if exists "Users upload own resumes" on storage.objects;
create policy "Users upload own resumes" on storage.objects for insert with check (bucket_id = 'resumes' and auth.role() = 'authenticated');

drop policy if exists "Users read own resumes" on storage.objects;
create policy "Users read own resumes" on storage.objects for select using (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users delete own resumes" on storage.objects;
create policy "Users delete own resumes" on storage.objects for delete using (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);
