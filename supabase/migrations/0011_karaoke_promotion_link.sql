alter table public.karaoke_promotions
  add column if not exists reference_url text;
