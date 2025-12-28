insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', false)
on conflict (id) do nothing;

-- storage.objects 정책은 "권한(소유자)" 이슈가 날 수 있어서
-- 1) 이미 있으면 스킵
-- 2) 권한 없으면 notice만 찍고 스킵 (마이그레이션 멈춤 방지)

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Submission files are readable by owner'
  ) then
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
  end if;
exception
  when insufficient_privilege then
    raise notice 'Skipping policy creation (insufficient_privilege) on storage.objects: Submission files are readable by owner';
  when duplicate_object then
    null;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Submission files are insertable by owner'
  ) then
    create policy "Submission files are insertable by owner"
    on storage.objects
    for insert
    with check (
      bucket_id = 'submissions'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
  end if;
exception
  when insufficient_privilege then
    raise notice 'Skipping policy creation (insufficient_privilege) on storage.objects: Submission files are insertable by owner';
  when duplicate_object then
    null;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Submission files are deletable by admin'
  ) then
    create policy "Submission files are deletable by admin"
    on storage.objects
    for delete
    using (
      bucket_id = 'submissions'
      and public.is_admin()
    );
  end if;
exception
  when insufficient_privilege then
    raise notice 'Skipping policy creation (insufficient_privilege) on storage.objects: Submission files are deletable by admin';
  when duplicate_object then
    null;
end $$;
