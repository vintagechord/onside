alter table public.album_tracks
  add column if not exists track_title_kr text,
  add column if not exists track_title_en text,
  add column if not exists track_title_official text;

alter table public.submissions
  add column if not exists mv_song_title_kr text,
  add column if not exists mv_song_title_en text,
  add column if not exists mv_song_title_official text;
