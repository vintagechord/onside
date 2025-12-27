alter table public.karaoke_requests
  add column if not exists payment_method payment_method not null default 'BANK',
  add column if not exists payment_status payment_status not null default 'UNPAID',
  add column if not exists amount_krw integer not null default 50000,
  add column if not exists bank_depositor_name text,
  add column if not exists tj_requested boolean not null default true,
  add column if not exists ky_requested boolean not null default true;

create table if not exists public.karaoke_votes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.karaoke_requests on delete cascade,
  voter_user_id uuid references auth.users on delete set null,
  voter_guest_email text,
  proof_path text,
  status text not null default 'PENDING',
  created_at timestamptz not null default now()
);

create table if not exists public.karaoke_credits (
  user_id uuid primary key references auth.users on delete cascade,
  balance integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.karaoke_credit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  delta integer not null,
  reason text,
  created_at timestamptz not null default now()
);

create trigger set_karaoke_credits_updated_at
before update on public.karaoke_credits
for each row execute procedure public.set_updated_at();

alter table public.karaoke_votes enable row level security;
alter table public.karaoke_credits enable row level security;
alter table public.karaoke_credit_events enable row level security;

create policy "Karaoke requests public readable"
on public.karaoke_requests
for select
using (true);

create policy "Karaoke votes readable"
on public.karaoke_votes
for select
using (voter_user_id = auth.uid() or public.is_admin());

create policy "Karaoke votes insertable"
on public.karaoke_votes
for insert
with check (voter_user_id = auth.uid());

create policy "Karaoke votes updatable"
on public.karaoke_votes
for update
using (public.is_admin())
with check (public.is_admin());

create policy "Karaoke credits readable"
on public.karaoke_credits
for select
using (user_id = auth.uid() or public.is_admin());

create policy "Karaoke credits writable"
on public.karaoke_credits
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Karaoke credit events readable"
on public.karaoke_credit_events
for select
using (user_id = auth.uid() or public.is_admin());

create policy "Karaoke credit events insertable"
on public.karaoke_credit_events
for insert
with check (public.is_admin());
