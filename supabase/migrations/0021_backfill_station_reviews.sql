insert into public.station_reviews (submission_id, station_id, status)
select s.id, ps.station_id, 'NOT_SENT'
from public.submissions s
join public.package_stations ps on ps.package_id = s.package_id
left join public.station_reviews sr
  on sr.submission_id = s.id
  and sr.station_id = ps.station_id
where sr.id is null
  and s.status <> 'DRAFT';
