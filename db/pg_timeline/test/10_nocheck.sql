set client_min_messages to notice;
-- setup
drop view if exists pgtl_nocheck_v;
drop table if exists pgtl_nocheck;

create table pgtl_nocheck (
    id serial primary key,
    tl_id bigint not null,
    value text not null,
    valid_time_range tstzrange not null
);

create view pgtl_nocheck_v as (
    select
        id,
        tl_id,
        value,
        lower(valid_time_range) as valid_from,
        upper(valid_time_range) as valid_to
    from pgtl_nocheck
);


create trigger pgtl_nocheck_v_insert_and_update
instead of insert or update
on pgtl_nocheck_v
for each row
execute procedure timeline.no_check('public.pgtl_nocheck', 'tl_id,value');

drop function if exists pgtl_nocheck_actual;
create or replace function pgtl_nocheck_actual()
returns table (v text, r tstzrange)
as $$
begin
    RETURN QUERY
    SELECT
        value,
        valid_time_range as range
    FROM pgtl_nocheck
    where tl_id = 1;
end;
$$ language plpgsql;

begin;
select plan(5);

-- happy path - non-overlapping ranges
insert into pgtl_nocheck_v (tl_id, value, valid_from, valid_to)
values
(1, 'a', '2020-01-01 00:00:00', '2020-02-01 00:00:00'),
(1, 'b', '2020-02-01 00:00:00', null);

select bag_eq(
    'SELECT v, r from pgtl_nocheck_actual()',
    $$VALUES
            ('a', '[2020-01-01 00:00:00,2020-02-01 00:00:00)'::tstzrange),
            ('b', '[2020-02-01 00:00:00,)')
        $$,
    'Simple insert'
);

-- new range overlaps with existing range
insert into pgtl_nocheck_v (tl_id, value, valid_from, valid_to)
values (1, 'c', '2020-03-01 00:00:00', null);

select bag_eq(
    'SELECT v, r from pgtl_nocheck_actual()',
    $$VALUES
            ('a', '[2020-01-01 00:00:00,2020-02-01 00:00:00)'::tstzrange),
            ('b', '[2020-02-01 00:00:00,)'),
            ('c', '[2020-03-01 00:00:00,)')
        $$,
    '(Not) overwriting open ended'
);

-- new range contains old range
insert into pgtl_nocheck_v (tl_id, value, valid_from, valid_to)
values (1, 'd', '2020-01-15 00:00:00', '2020-03-15 00:00:00');

select bag_eq(
    'SELECT v, r from pgtl_nocheck_actual()',
    $$VALUES
            ('a', '[2020-01-01 00:00:00,2020-02-01 00:00:00)'::tstzrange),
            ('b', '[2020-02-01 00:00:00,)'),
            ('c', '[2020-03-01 00:00:00,)'),
            ('d', '[2020-01-15 00:00:00,2020-03-15 00:00:00)')
        $$,
    'Contains'
);

-- extend a range
update pgtl_nocheck_v set valid_to = '2020-03-17 00:00:00'
where value = 'd';
select bag_eq(
    'SELECT v, r from pgtl_nocheck_actual()',
    $$VALUES
            ('a', '[2020-01-01 00:00:00,2020-02-01 00:00:00)'::tstzrange),
            ('b', '[2020-02-01 00:00:00,)'),
            ('c', '[2020-03-01 00:00:00,)'),
            ('d', '[2020-01-15 00:00:00,2020-03-17 00:00:00)')
        $$,
    'Extended range'
);

-- return id
drop function if exists pgtl_nocheck_insert;
create or replace function pgtl_nocheck_insert()
returns bigint
as $$
DECLARE
    lv_id bigint;
begin
    insert into pgtl_nocheck_v (tl_id, value, valid_from)
    values (1, 'd', '2020-01-15 00:00:00') returning id into lv_id;

    return lv_id;
end;
$$ language plpgsql;

select isnt(pgtl_nocheck_insert(), null, 'Returns ID');

select finish();

rollback;
