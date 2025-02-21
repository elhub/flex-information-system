set client_min_messages to notice;
-- setup
drop table if exists pgtl_midnight;

create table pgtl_midnight (
    id serial primary key,
    tl_id bigint not null,
    value text not null,
    valid_time_range tstzrange not null
);

create trigger pgtl_midnight_upsert
before insert or update
on pgtl_midnight
for each row
execute function timeline_midnight_aligned();

begin;
select plan(7);

-- noqa: disable=all

-- insert midnight values in both UTC and Norwegian timezones : OK

prepare try_insert_abcdefgh as
insert into pgtl_midnight (tl_id, value, valid_time_range)
values
(1, 'a', tstzrange('2025-01-01 23:00:00+0', '2025-01-05 23:00:00+0')),
(1, 'b', tstzrange('2025-01-01 00:00:00+1', '2025-01-05 23:00:00+0')),
(1, 'c', tstzrange('2025-01-01 23:00:00+0', '2025-01-05 00:00:00+1')),
(1, 'd', tstzrange('2025-07-01 22:00:00+0', '2025-07-05 22:00:00+0')),
(1, 'e', tstzrange('2025-07-01 22:00:00+0', '2025-07-05 00:00:00+2')),
(1, 'f', tstzrange('2025-07-01 00:00:00+2', '2025-07-05 22:00:00+0')),
(1, 'g', tstzrange('2025-07-01 00:00:00+2', null)),
(1, 'h', tstzrange(null, null));
select lives_ok('try_insert_abcdefgh');

-- just change the day, staying at midnight,
-- in both UTC and Norwegian timezones : OK

prepare try_update_a1 as
update pgtl_midnight
set valid_time_range = tstzrange(
    lower(valid_time_range),
    '2025-01-09 23:00:00+0'
)
where value = 'a';
select lives_ok('try_update_a1');

prepare try_update_a2 as
update pgtl_midnight
set valid_time_range = tstzrange(
    '2024-11-27 00:00:00+1',
    upper(valid_time_range)
)
where value = 'a';
select lives_ok('try_update_a2');

prepare try_update_a3 as
update pgtl_midnight
set valid_time_range = tstzrange(
    '2024-07-01 00:00:00+2',
    '2024-07-05 22:00:00+0'
)
where value = 'a';
select lives_ok('try_update_a3');

-- try to stray away from midnight : KO

prepare try_update_b1 as
update pgtl_midnight
set valid_time_range = tstzrange(
    lower(valid_time_range),
    '2025-01-09 23:00:00+1'
)
where value = 'b';
select throws_ok('try_update_b1');

prepare try_update_b2 as
update pgtl_midnight
set valid_time_range = tstzrange(
    '2024-12-20 00:00:00+0',
    upper(valid_time_range)
)
where value = 'b';
select throws_ok('try_update_b2');

prepare try_update_b3 as
update pgtl_midnight
set valid_time_range = tstzrange(
    '2024-07-01 00:00:00+1',
    '2024-07-05 22:00:00+2'
)
where value = 'b';
select throws_ok('try_update_b3');

-- noqa: enable=all

select finish();

rollback;
