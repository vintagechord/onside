create extension if not exists "pgcrypto";

do $$ begin
  create type submission_type as enum ('ALBUM', 'MV_DISTRIBUTION', 'MV_BROADCAST');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type payment_status as enum ('UNPAID', 'PAYMENT_PENDING', 'PAID', 'REFUNDED');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type submission_status as enum ('DRAFT', 'SUBMITTED', 'PRE_REVIEW', 'WAITING_PAYMENT', 'IN_PROGRESS', 'RESULT_READY', 'COMPLETED');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type file_kind as enum ('AUDIO', 'VIDEO', 'LYRICS', 'ETC');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type station_review_status as enum ('NOT_SENT', 'SENT', 'RECEIVED', 'APPROVED', 'REJECTED', 'NEEDS_FIX');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type karaoke_status as enum ('REQUESTED', 'IN_REVIEW', 'COMPLETED');
exception when duplicate_object then null;
end $$;

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  station_count integer not null,
  price_krw integer not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists packages_name_key on public.packages (name);

create table if not exists public.stations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists stations_code_key on public.stations (code);

create table if not exists public.package_stations (
  package_id uuid not null references public.packages on delete cascade,
  station_id uuid not null references public.stations on delete cascade,
  primary key (package_id, station_id)
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  type submission_type not null,
  title text,
  artist_name text,
  release_date date,
  genre text,
  mv_runtime text,
  mv_format text,
  package_id uuid references public.packages,
  amount_krw integer not null default 0,
  pre_review_requested boolean not null default false,
  karaoke_requested boolean not null default false,
  payment_status payment_status not null default 'UNPAID',
  status submission_status not null default 'DRAFT',
  bank_depositor_name text,
  admin_memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.album_tracks (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions on delete cascade,
  track_no integer not null,
  track_title text,
  featuring text,
  composer text,
  lyricist text,
  notes text,
  is_title boolean not null default false
);

create table if not exists public.submission_files (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions on delete cascade,
  kind file_kind not null,
  file_path text not null,
  original_name text,
  mime text,
  size bigint,
  created_at timestamptz not null default now()
);

create table if not exists public.station_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions on delete cascade,
  station_id uuid not null references public.stations on delete cascade,
  status station_review_status not null default 'NOT_SENT',
  result_note text,
  updated_at timestamptz not null default now()
);

create table if not exists public.submission_events (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions on delete cascade,
  actor_user_id uuid references auth.users on delete set null,
  event_type text not null,
  message text,
  created_at timestamptz not null default now()
);

create table if not exists public.karaoke_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  artist text,
  contact text,
  notes text,
  file_path text,
  status karaoke_status not null default 'REQUESTED',
  created_at timestamptz not null default now()
);

-- triggers: 재실행 대비 (있으면 드롭 후 생성)
drop trigger if exists set_submissions_updated_at on public.submissions;
create trigger set_submissions_updated_at
before update on public.submissions
for each row execute procedure public.set_updated_at();

drop trigger if exists set_station_reviews_updated_at on public.station_reviews;
create trigger set_station_reviews_updated_at
before update on public.station_reviews
for each row execute procedure public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.can_access_submission(target_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.submissions s
    where s.id = target_id
      and (s.user_id = auth.uid() or public.is_admin())
  );
$$;

alter table public.packages enable row level security;
alter table public.stations enable row level security;
alter table public.package_stations enable row level security;
alter table public.submissions enable row level security;
alter table public.album_tracks enable row level security;
alter table public.submission_files enable row level security;
alter table public.station_reviews enable row level security;
alter table public.submission_events enable row level security;
alter table public.karaoke_requests enable row level security;

-- policies: 재실행 대비 (있으면 드롭 후 생성)
drop policy if exists "Packages readable" on public.packages;
create policy "Packages readable"
on public.packages
for select
using (true);

drop policy if exists "Stations readable" on public.stations;
create policy "Stations readable"
on public.stations
for select
using (true);

drop policy if exists "Package stations readable" on public.package_stations;
create policy "Package stations readable"
on public.package_stations
for select
using (true);

drop policy if exists "Admin manages packages" on public.packages;
create policy "Admin manages packages"
on public.packages
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admin manages stations" on public.stations;
create policy "Admin manages stations"
on public.stations
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admin manages package stations" on public.package_stations;
create policy "Admin manages package stations"
on public.package_stations
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Submissions readable" on public.submissions;
create policy "Submissions readable"
on public.submissions
for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Submissions insertable" on public.submissions;
create policy "Submissions insertable"
on public.submissions
for insert
with check (user_id = auth.uid());

drop policy if exists "Submissions updatable" on public.submissions;
create policy "Submissions updatable"
on public.submissions
for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "Tracks readable" on public.album_tracks;
create policy "Tracks readable"
on public.album_tracks
for select
using (public.can_access_submission(submission_id));

drop policy if exists "Tracks insertable" on public.album_tracks;
create policy "Tracks insertable"
on public.album_tracks
for insert
with check (public.can_access_submission(submission_id));

drop policy if exists "Tracks updatable" on public.album_tracks;
create policy "Tracks updatable"
on public.album_tracks
for update
using (public.can_access_submission(submission_id))
with check (public.can_access_submission(submission_id));

drop policy if exists "Tracks deletable" on public.album_tracks;
create policy "Tracks deletable"
on public.album_tracks
for delete
using (public.can_access_submission(submission_id));

drop policy if exists "Files readable" on public.submission_files;
create policy "Files readable"
on public.submission_files
for select
using (public.can_access_submission(submission_id));

drop policy if exists "Files insertable" on public.submission_files;
create policy "Files insertable"
on public.submission_files
for insert
with check (public.can_access_submission(submission_id));

drop policy if exists "Files deletable" on public.submission_files;
create policy "Files deletable"
on public.submission_files
for delete
using (public.can_access_submission(submission_id));

drop policy if exists "Station reviews readable" on public.station_reviews;
create policy "Station reviews readable"
on public.station_reviews
for select
using (public.can_access_submission(submission_id));

drop policy if exists "Station reviews insertable" on public.station_reviews;
create policy "Station reviews insertable"
on public.station_reviews
for insert
with check (public.can_access_submission(submission_id) and status = 'NOT_SENT');

drop policy if exists "Station reviews updatable" on public.station_reviews;
create policy "Station reviews updatable"
on public.station_reviews
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Submission events readable" on public.submission_events;
create policy "Submission events readable"
on public.submission_events
for select
using (public.can_access_submission(submission_id));

drop policy if exists "Submission events insertable" on public.submission_events;
create policy "Submission events insertable"
on public.submission_events
for insert
with check (public.can_access_submission(submission_id));

drop policy if exists "Karaoke requests readable" on public.karaoke_requests;
create policy "Karaoke requests readable"
on public.karaoke_requests
for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Karaoke requests insertable" on public.karaoke_requests;
create policy "Karaoke requests insertable"
on public.karaoke_requests
for insert
with check (user_id = auth.uid());

drop policy if exists "Karaoke requests updatable" on public.karaoke_requests;
create policy "Karaoke requests updatable"
on public.karaoke_requests
for update
using (public.is_admin());
