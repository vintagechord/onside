create table if not exists public.karaoke_promotions (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions on delete cascade,
  owner_user_id uuid references auth.users on delete set null,
  status text not null default 'PENDING',
  credits_required integer not null default 10,
  credits_balance integer not null default 0,
  tj_enabled boolean not null default true,
  ky_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.karaoke_promotion_contributions (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references public.karaoke_promotions on delete cascade,
  contributor_user_id uuid references auth.users on delete set null,
  credits integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.karaoke_promotion_recommendations (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references public.karaoke_promotions on delete cascade,
  recommender_user_id uuid references auth.users on delete set null,
  proof_path text,
  status text not null default 'PENDING',
  created_at timestamptz not null default now()
);

create trigger set_karaoke_promotions_updated_at
before update on public.karaoke_promotions
for each row execute procedure public.set_updated_at();

alter table public.karaoke_promotions enable row level security;
alter table public.karaoke_promotion_contributions enable row level security;
alter table public.karaoke_promotion_recommendations enable row level security;

create policy "Karaoke promotions readable"
on public.karaoke_promotions
for select
using (
  status = 'ACTIVE'
  or owner_user_id = auth.uid()
  or public.is_admin()
);

create policy "Karaoke promotions insertable"
on public.karaoke_promotions
for insert
with check (owner_user_id = auth.uid());

create policy "Karaoke promotions updatable"
on public.karaoke_promotions
for update
using (public.is_admin())
with check (public.is_admin());

create policy "Karaoke contributions readable"
on public.karaoke_promotion_contributions
for select
using (contributor_user_id = auth.uid() or public.is_admin());

create policy "Karaoke contributions insertable"
on public.karaoke_promotion_contributions
for insert
with check (contributor_user_id = auth.uid());

create policy "Karaoke contributions updatable"
on public.karaoke_promotion_contributions
for update
using (public.is_admin())
with check (public.is_admin());

create policy "Karaoke recommendations readable"
on public.karaoke_promotion_recommendations
for select
using (recommender_user_id = auth.uid() or public.is_admin());

create policy "Karaoke recommendations insertable"
on public.karaoke_promotion_recommendations
for insert
with check (recommender_user_id = auth.uid());

create policy "Karaoke recommendations updatable"
on public.karaoke_promotion_recommendations
for update
using (public.is_admin())
with check (public.is_admin());
