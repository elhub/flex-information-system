set client_min_messages to notice;
-- setup
drop table if exists pgtl_is_empty;

create table pgtl_is_empty (
    id serial primary key,
    tl_id bigint not null,
    value text not null,
    valid_time_range tstzrange not null
);

insert into pgtl_is_empty (tl_id, value, valid_time_range)
values
(1, 'a', '[2020-02-01 00:00:00+0,)'),
(2, 'b', '[2020-02-01 00:00:00+0, 2030-02-01 00:00:00+0)'),
(3, 'c', '[2015-02-01 00:00:00+0, 2020-02-01 00:00:00+0)'),
(4, 'd', '[2030-02-01 00:00:00+0,)');


begin;
select plan(5);

-- test
select ok(not timeline.is_empty('public.pgtl_is_empty', 'tl_id', 1));
select ok(not timeline.is_empty('public.pgtl_is_empty', 'tl_id', 2));
select ok(timeline.is_empty('public.pgtl_is_empty', 'tl_id', 3));
select ok(timeline.is_empty('public.pgtl_is_empty', 'tl_id', 4));
select ok(timeline.is_empty('public.pgtl_is_empty', 'tl_id', 5));

select finish();
rollback;
