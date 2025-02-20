set client_min_messages to notice;
-- setup
drop table if exists pgtl_window;

create table pgtl_window (
    id serial primary key,
    tl_id bigint not null,
    value text not null,
    valid_time_range tstzrange not null
);

create trigger pgtl_window_upsert
before insert
on pgtl_window
for each row
execute function timeline_valid_start_window('2 days', '1 week');

begin;
select plan(5);

-- noqa: disable=all

prepare try_insert_abcd as
insert into pgtl_window (tl_id, value, valid_time_range)
values
(
  1,
  'a',
  tstzrange(
    current_timestamp + '2 days'::interval,
    current_timestamp + '4 days'::interval
  )
),
(
  1,
  'b',
  tstzrange(
    current_timestamp + '2 days'::interval,
    current_timestamp + '12 days'::interval
  )
),
(
  1,
  'c',
  tstzrange(
    current_timestamp + '3 days'::interval,
    null
  )
),
(
  1,
  'd',
  tstzrange(
    current_timestamp + '3 days'::interval,
    current_timestamp + '5 days'::interval
  )
);
select lives_ok('try_insert_abcd');

prepare try_insert_e as
insert into pgtl_window (tl_id, value, valid_time_range)
values
(
  1,
  'e',
  tstzrange(
    current_timestamp + '1 day'::interval,
    current_timestamp + '4 days'::interval
  )
);
select throws_ok('try_insert_e');

prepare try_insert_f as
insert into pgtl_window (tl_id, value, valid_time_range)
values
(
  1,
  'f',
  tstzrange(
    current_timestamp - '2 days'::interval,
    null
  )
);
select throws_ok('try_insert_f');

prepare try_insert_g as
insert into pgtl_window (tl_id, value, valid_time_range)
values
(
  1,
  'g',
  tstzrange(
    current_timestamp + '9 days 1 microsecond'::interval, -- after the limit
    current_timestamp + '12 days'::interval
  )
);
select throws_ok('try_insert_g');

prepare try_insert_h as
insert into pgtl_window (tl_id, value, valid_time_range)
values
(
  1,
  'h',
  tstzrange(
    current_timestamp + '11 days'::interval,
    current_timestamp + '14 days'::interval
  )
);
select throws_ok('try_insert_h');

-- noqa: enable=all

select finish();

rollback;
