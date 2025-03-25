set client_min_messages to notice;
-- setup
drop table if exists pgtl_make_room;

create table pgtl_make_room (
    id serial primary key,
    tl_id bigint not null,
    value text not null,
    valid_time_range tstzrange not null
);


create trigger pgtl_make_room_trg
before insert or update
on pgtl_make_room
for each row
execute procedure timeline.make_room(
    'tl_id'
);

drop function if exists pgtl_make_room_actual;
create or replace function pgtl_make_room_actual()
returns table (v text, r tstzrange)
as $$
begin
    RETURN QUERY
    SELECT
        value,
        valid_time_range as range
    FROM pgtl_make_room
    where tl_id = 1;
end;
$$ language plpgsql;

begin;
select plan(6);

-- happy path - non-overlapping ranges
insert into pgtl_make_room (tl_id, value, valid_time_range)
values
(1, 'a', '[2020-01-01 00:00:00,2020-02-01 00:00:00)'),
(1, 'b', '[2020-02-01 00:00:00,)');

select bag_eq(
    'SELECT v, r from pgtl_make_room_actual()',
    $$VALUES
            ('a', '[2020-01-01 00:00:00,2020-02-01 00:00:00)'::tstzrange),
            ('b', '[2020-02-01 00:00:00,)')
        $$,
    'Simple insert'
);

-- new range overlaps with existing range
insert into pgtl_make_room (tl_id, value, valid_time_range)
values (1, 'c', '[2020-03-01 00:00:00,)');

select bag_eq(
    'SELECT v, r from pgtl_make_room_actual()',
    $$VALUES
            ('a', '[2020-01-01 00:00:00,2020-02-01 00:00:00)'::tstzrange),
            ('b', '[2020-02-01 00:00:00,2020-03-01 00:00:00)'),
            ('c', '[2020-03-01 00:00:00,)')
        $$,
    'Overwriting open ended'
);

-- new range contains old range
insert into pgtl_make_room (tl_id, value, valid_time_range)
values (1, 'd', '[2020-01-15 00:00:00,2020-03-15 00:00:00)');

select bag_eq(
    'SELECT v, r from pgtl_make_room_actual()',
    $$VALUES
            ('a', '[2020-01-01 00:00:00,2020-01-15 00:00:00)'::tstzrange),
            ('d', '[2020-01-15 00:00:00,2020-03-15 00:00:00)'),
            ('c', '[2020-03-15 00:00:00,)')
        $$,
    'Contains'
);

-- old range contains new range
insert into pgtl_make_room (tl_id, value, valid_time_range)
values (1, 'e', '[2020-02-01 00:00:00,2020-02-15 00:00:00)');

select bag_eq(
    'SELECT v, r from pgtl_make_room_actual()',
    $$VALUES
            ('a', '[2020-01-01 00:00:00,2020-01-15 00:00:00)'::tstzrange),
            ('d', '[2020-01-15 00:00:00,2020-02-01 00:00:00)'),
            ('e', '[2020-02-01 00:00:00,2020-02-15 00:00:00)'),
            ('c', '[2020-03-15 00:00:00,)')
        $$,
    'Contains'
);

-- extend a range
update pgtl_make_room
set valid_time_range = tstzrange(lower(valid_time_range), '2020-03-17 00:00:00')
where value = 'd'
    and lower(valid_time_range) = '2020-01-15 00:00:00';

select bag_eq(
    'SELECT v, r from pgtl_make_room_actual()',
    $$VALUES
            ('a', '[2020-01-01 00:00:00,2020-01-15 00:00:00)'::tstzrange),
            ('d', '[2020-01-15 00:00:00,2020-03-17 00:00:00)'),
            ('c', '[2020-03-17 00:00:00,)')
        $$,
    'Extended range'
);

-- return id
drop function if exists pgtl_make_room_insert;
create or replace function pgtl_make_room_insert()
returns bigint
as $$
DECLARE
    lv_id bigint;
begin
    insert into pgtl_make_room (tl_id, value, valid_time_range)
    values (1, 'd', '[2020-01-15 00:00:00,)') returning id into lv_id;

    return lv_id;
end;
$$ language plpgsql;

select isnt(pgtl_make_room_insert(), null, 'Returns ID');

select finish();
rollback;
