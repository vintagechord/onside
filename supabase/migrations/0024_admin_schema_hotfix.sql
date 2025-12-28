alter table public.submissions
  alter column user_id drop not null;

alter table public.submissions
  add column if not exists guest_name text,
  add column if not exists guest_company text,
  add column if not exists guest_email text,
  add column if not exists guest_phone text,
  add column if not exists guest_token text;

do $$ begin
  create type payment_method as enum ('BANK', 'CARD');
exception
  when duplicate_object then null;
end $$;

alter table public.submissions
  add column if not exists payment_method payment_method not null default 'BANK',
  add column if not exists mv_base_selected boolean not null default true,
  add column if not exists mv_rating_file_path text;

alter table public.album_tracks
  add column if not exists arranger text,
  add column if not exists lyrics text;

create unique index if not exists submissions_guest_token_key
  on public.submissions (guest_token);

alter table public.karaoke_requests
  alter column user_id drop not null;

alter table public.karaoke_requests
  add column if not exists guest_name text,
  add column if not exists guest_email text,
  add column if not exists guest_phone text;

create table if not exists public.ad_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  link_url text,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  create trigger set_ad_banners_updated_at
  before update on public.ad_banners
  for each row execute procedure public.set_updated_at();
exception
  when duplicate_object then null;
end $$;

alter table public.ad_banners enable row level security;

do $$ begin
  create policy "Ad banners readable"
  on public.ad_banners
  for select
  using (
    is_active
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admin manages ad banners"
  on public.ad_banners
  for all
  using (public.is_admin())
  with check (public.is_admin());
exception
  when duplicate_object then null;
end $$;

insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', false)
on conflict (id) do nothing;

do $$ begin
  create policy "Submission files are readable by owner"
  on storage.objects
  for select
  using (
    bucket_id = 'submissions'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "Submission files are insertable by owner"
  on storage.objects
  for insert
  with check (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "Submission files are deletable by admin"
  on storage.objects
  for delete
  using (
    bucket_id = 'submissions'
    and public.is_admin()
  );
exception
  when duplicate_object then null;
end $$;
