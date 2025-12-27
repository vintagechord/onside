alter table public.submissions
  add column if not exists mv_rating_file_path text;
