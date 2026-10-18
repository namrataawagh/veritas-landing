-- DPDPA consent records + self-service erasure.
-- Run this once in the Supabase SQL editor, after 0001_download_requests.sql.

-- One row per consent given. Withdrawing sets withdrawn_at; the newest row with
-- withdrawn_at = null is the user's active consent.
create table if not exists public.consents (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  notice_version text not null,              -- which version of the consent notice was shown
  purposes       text[] not null,            -- e.g. {installation_guide}
  granted_at     timestamptz not null default now(),
  withdrawn_at   timestamptz
);

create index if not exists consents_user_granted_idx on public.consents (user_id, granted_at desc);

alter table public.consents enable row level security;

drop policy if exists "read own consents" on public.consents;
create policy "read own consents"
  on public.consents for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "give own consent" on public.consents;
create policy "give own consent"
  on public.consents for insert to authenticated
  with check (user_id = auth.uid() and withdrawn_at is null);

drop policy if exists "withdraw own consent" on public.consents;
create policy "withdraw own consent"
  on public.consents for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Erasure: deletes the caller's auth user. download_requests and consents rows
-- go with it through their ON DELETE CASCADE foreign keys.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
