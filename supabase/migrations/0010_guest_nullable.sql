alter table public.submissions
  alter column user_id drop not null;

alter table public.karaoke_requests
  alter column user_id drop not null;
