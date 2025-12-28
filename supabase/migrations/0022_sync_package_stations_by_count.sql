insert into public.stations (name, code, is_active)
values
  ('KBS', 'KBS', true),
  ('MBC', 'MBC', true),
  ('SBS', 'SBS', true),
  ('YTN', 'YTN', true),
  ('CBS 기독교방송', 'CBS', true),
  ('WBS 원음방송', 'WBS', true),
  ('TBS 교통방송', 'TBS', true),
  ('PBC 평화방송', 'PBC', true),
  ('BBS 불교방송', 'BBS', true),
  ('Arirang 방송', 'ARIRANG', true),
  ('경인 iFM', 'GYEONGIN_IFM', true),
  ('TBN 한국교통방송', 'TBN', true),
  ('KISS 디지털 라디오 음악방송', 'KISS', true),
  ('극동방송(Only CCM)', 'FEBC', true),
  ('국악방송(Only 국악)', 'GUGAK', true)
on conflict (code) do update
set name = excluded.name,
    is_active = excluded.is_active;

update public.stations
set is_active = false
where code not in (
  'KBS', 'MBC', 'SBS', 'YTN',
  'CBS', 'WBS', 'TBS', 'PBC', 'BBS',
  'ARIRANG', 'GYEONGIN_IFM', 'TBN', 'KISS',
  'FEBC', 'GUGAK'
);

delete from public.package_stations ps
using public.packages p
where ps.package_id = p.id
  and p.station_count in (7, 10, 13, 15);

with station_map as (
  select 7 as station_count, unnest(array['KBS', 'MBC', 'SBS', 'CBS', 'WBS', 'TBS', 'YTN']) as code
  union all
  select 10, unnest(array['KBS', 'MBC', 'SBS', 'TBS', 'CBS', 'PBC', 'WBS', 'BBS', 'YTN', 'ARIRANG'])
  union all
  select 13, unnest(array[
    'KBS', 'MBC', 'SBS', 'TBS', 'CBS', 'PBC', 'WBS', 'BBS', 'YTN',
    'GYEONGIN_IFM', 'TBN', 'ARIRANG', 'KISS'
  ])
  union all
  select 15, unnest(array[
    'KBS', 'MBC', 'SBS', 'TBS', 'CBS', 'PBC', 'WBS', 'BBS', 'YTN',
    'GYEONGIN_IFM', 'TBN', 'ARIRANG', 'KISS', 'FEBC', 'GUGAK'
  ])
),
package_map as (
  select id, station_count
  from public.packages
  where station_count in (7, 10, 13, 15)
),
mapped as (
  select p.id as package_id, s.id as station_id
  from package_map p
  join station_map m on m.station_count = p.station_count
  join public.stations s on s.code = m.code
)
insert into public.package_stations (package_id, station_id)
select package_id, station_id
from mapped
on conflict do nothing;
