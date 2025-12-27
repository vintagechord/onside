alter table public.submissions
  add column if not exists artist_name_kr text,
  add column if not exists artist_name_en text,
  add column if not exists distributor text,
  add column if not exists production_company text,
  add column if not exists applicant_name text,
  add column if not exists applicant_email text,
  add column if not exists applicant_phone text,
  add column if not exists previous_release text,
  add column if not exists artist_type text,
  add column if not exists artist_gender text,
  add column if not exists artist_members text,
  add column if not exists is_oneclick boolean not null default false,
  add column if not exists melon_url text;

alter table public.album_tracks
  add column if not exists title_role text,
  add column if not exists broadcast_selected boolean not null default false;
