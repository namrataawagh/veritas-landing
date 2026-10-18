-- Download requests: one row per "Download now" click by a signed-in user.
-- Run this once in the Supabase SQL editor (or with `supabase db push`).

create table if not exists public.download_requests (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  email        text not null,
  full_name    text,
  os           text not null check (os in ('linux', 'macos', 'windows')),
  email_status text not null default 'sent' check (email_status in ('sent', 'failed')),
  email_id     text,                       -- Resend message id, for tracing deliveries
  created_at   timestamptz not null default now()
);

create index if not exists download_requests_user_created_idx
  on public.download_requests (user_id, created_at desc);

alter table public.download_requests enable row level security;

-- Users can only see and create their own requests. No update/delete from clients.
drop policy if exists "read own download requests" on public.download_requests;
create policy "read own download requests"
  on public.download_requests for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "create own download requests" on public.download_requests;
create policy "create own download requests"
  on public.download_requests for insert
  to authenticated
  with check (user_id = auth.uid());
