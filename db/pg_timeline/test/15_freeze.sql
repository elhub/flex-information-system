set client_min_messages to notice;
-- setup
drop table if exists pgtl_freeze;

create table pgtl_freeze (
    id serial primary key,
    tl_id bigint not null,
    value text not null,
    valid_time_range tstzrange not null
);

insert into pgtl_freeze (tl_id, value, valid_time_range)
values
(
    2,
    'j',
    tstzrange(
        current_timestamp - '9 days'::interval,
        current_timestamp - '7 days'::interval
    )
),
(
    2,
    'k',
    tstzrange(
        current_timestamp - '9 days'::interval,
        current_timestamp - '3 days'::interval
    )
),
(
    2,
    'l',
    tstzrange(
        current_timestamp - '9 days'::interval,
        null
    )
),
(
    2,
    'm',
    tstzrange(
        current_timestamp - '3 days'::interval,
        current_timestamp - '2 days'::interval
    )
);

create trigger pgtl_freeze_upsert
before insert or update
on pgtl_freeze
for each row
execute function timeline_freeze('5 days');

drop function if exists pgtl_freeze_actual;
create or replace function pgtl_freeze_actual()
returns table (v text)
as $$
begin
    RETURN QUERY
    SELECT
        value
    FROM pgtl_freeze
    where tl_id = 1;
end;
$$ language plpgsql;

begin;
select plan(15);

insert into pgtl_freeze (tl_id, value, valid_time_range)
values
-- recent or future contract : OK
(
    1,
    'a',
    tstzrange(
        current_timestamp - '4 days'::interval,
        current_timestamp - '2 days'::interval
    )
),
(1, 'b', tstzrange(current_timestamp - '4 days'::interval, null)),
(
    1,
    'c',
    tstzrange(
        current_timestamp - '1 day'::interval,
        current_timestamp + '2 days'::interval
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
select bag_eq(
    'SELECT v from pgtl_freeze_actual()',
    $$VALUES
            ('a'),
            ('b'),
            ('c'),
            ('d')
        $$,
    'Insert'
);

-- starting before the limit : KO

-- noqa: disable=all
prepare try_insert_e as
insert into pgtl_freeze (tl_id, value, valid_time_range)
values
(
    1,
    'e',
    tstzrange(
        current_timestamp - '9 days'::interval,
        current_timestamp - '7 days'::interval
    )
);

prepare try_insert_f as
insert into pgtl_freeze (tl_id, value, valid_time_range)
values
(
    1,
    'f',
    tstzrange(
        current_timestamp - '9 days'::interval,
        current_timestamp - '3 days'::interval
    )
);

prepare try_insert_g as
insert into pgtl_freeze (tl_id, value, valid_time_range)
values
(1, 'g', tstzrange(current_timestamp - '9 days'::interval, null));

-- update a fully frozen contract : KO

prepare try_update_j1 as
update pgtl_freeze
set valid_time_range = tstzrange(
    current_timestamp - '8 days'::interval,
    current_timestamp - '2 days'::interval
)
where value = 'j';

prepare try_update_j2 as
update pgtl_freeze
set valid_time_range = tstzrange(
    current_timestamp - '3 days'::interval,
    current_timestamp - '2 days'::interval
)
where value = 'j';

-- update a partially frozen contract :
--   OK if start does not move and end stays after the limit

prepare try_update_k1 as
update pgtl_freeze
set valid_time_range = tstzrange(
    current_timestamp - '7 days'::interval,
    current_timestamp - '2 days'::interval
)
where value = 'k';

prepare try_update_k2 as
update pgtl_freeze
set valid_time_range = tstzrange(
    lower(valid_time_range),
    current_timestamp - '6 days'::interval
)
where value = 'k';

prepare try_update_k3 as
update pgtl_freeze
set valid_time_range = tstzrange(
    lower(valid_time_range),
    null
)
where value = 'k';

prepare try_update_k4 as
update pgtl_freeze
set valid_time_range = tstzrange(
    lower(valid_time_range),
    current_timestamp - '2 days'::interval
)
where value = 'k';

-- update a partially frozen non-ending contract :
--   OK if start does not move and end stays after the limit

prepare try_update_l1 as
update pgtl_freeze
set valid_time_range = tstzrange(
    current_timestamp - '7 days'::interval,
    null
)
where value = 'l';

prepare try_update_l2 as
update pgtl_freeze
set valid_time_range = tstzrange(
    lower(valid_time_range),
    current_timestamp - '6 days'::interval
)
where value = 'l';

prepare try_update_l3 as
update pgtl_freeze
set valid_time_range = tstzrange(
    lower(valid_time_range),
    current_timestamp - '2 days'::interval
)
where value = 'l';

-- update non-frozen contract : OK if new range is not frozen

prepare try_update_m1 as
update pgtl_freeze
set valid_time_range = tstzrange(
    current_timestamp - '4 days'::interval,
    current_timestamp - '1 days'::interval
)
where value = 'm';

prepare try_update_m2 as
update pgtl_freeze
set valid_time_range = tstzrange(
    current_timestamp - '6 days'::interval,
    current_timestamp - '1 days'::interval
)
where value = 'm';

-- noqa: enable=all

select throws_ok('try_insert_e');
select throws_ok('try_insert_f');
select throws_ok('try_insert_g');

select throws_ok('try_update_j1');
select throws_ok('try_update_j2');

select throws_ok('try_update_k1');
select throws_ok('try_update_k2');
select lives_ok('try_update_k3');
select lives_ok('try_update_k4');

select throws_ok('try_update_l1');
select throws_ok('try_update_l2');
select lives_ok('try_update_l3');

select lives_ok('try_update_m1');
select throws_ok('try_update_m2');

select finish();

rollback;
