insert into storage.buckets (id, name, public)
values ('banners', 'banners', true)
on conflict (id) do update
set public = excluded.public;

do $$
begin
  create policy "Banners public readable"
    on storage.objects
    for select
    using (bucket_id = 'banners');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create policy "Admin manages banner files"
    on storage.objects
    for all
    using (bucket_id = 'banners' and public.is_admin())
    with check (bucket_id = 'banners' and public.is_admin());
exception
  when duplicate_object then null;
end $$;
