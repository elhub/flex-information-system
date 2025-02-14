set client_min_messages to notice;
-- setup
drop table if exists pgtl_restrict;

create table pgtl_restrict (
    id serial primary key,
    tl_id bigint not null,
    value text not null,
    valid_time_range tstzrange not null
);

create trigger pgtl_restrict_insert
before insert
on pgtl_restrict
for each row
execute function timeline_restrict('5 days');

drop function if exists pgtl_restrict_actual;
create or replace function pgtl_restrict_actual()
returns table (v text)
as $$
begin
    RETURN QUERY
    SELECT
        value
    FROM pgtl_restrict
    where tl_id = 1;
end;
$$ language plpgsql;

begin;
select plan(4);

insert into pgtl_restrict (tl_id, value, valid_time_range)
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
    'SELECT v from pgtl_restrict_actual()',
    $$VALUES
            ('a'),
            ('b'),
            ('c'),
            ('d')
        $$,
    'Insert restricted contract'
);

-- starting before the limit : KO

-- noqa: disable=all
prepare try_insert_e as
insert into pgtl_restrict (tl_id, value, valid_time_range)
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
insert into pgtl_restrict (tl_id, value, valid_time_range)
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
insert into pgtl_restrict (tl_id, value, valid_time_range)
values
(1, 'g', tstzrange(current_timestamp - '9 days'::interval, null));
-- noqa: enable=all

select throws_ok('try_insert_e');
select throws_ok('try_insert_f');
select throws_ok('try_insert_g');

select finish();

rollback;
