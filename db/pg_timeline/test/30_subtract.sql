set client_min_messages to notice;

begin;
select plan(14);

-- noqa: disable=all

-- compute [A, B) - [C, D)

-- case : A <= B <= C <= D

select is(
  timeline_valid_time_subtract(
    tstzrange('2020-01-01 01:00:00', '2020-02-02 02:00:00', '[)'),
    tstzrange('2020-03-03 03:00:00', '2020-04-04 04:00:00', '[)')
  ),
  array[
    tstzrange('2020-01-01 01:00:00', '2020-02-02 02:00:00', '[)')
  ]
);

select is(
  timeline_valid_time_subtract(
    tstzrange('2020-01-01 01:00:00', '2020-02-02 02:00:00', '[)'),
    tstzrange('2020-03-03 03:00:00',  null,                 '[)')
  ),
  array[
    tstzrange('2020-01-01 01:00:00', '2020-02-02 02:00:00', '[)')
  ]
);

-- case : A <= C <= B <= D

select is(
  timeline_valid_time_subtract(
    tstzrange('2020-01-01 01:00:00', '2020-03-03 03:00:00', '[)'),
    tstzrange('2020-02-02 02:00:00', '2020-04-04 04:00:00', '[)')
  ),
  array[
    tstzrange('2020-01-01 01:00:00', '2020-02-02 02:00:00', '[)')
  ]
);

select is(
  timeline_valid_time_subtract(
    tstzrange('2020-01-01 01:00:00', '2020-03-03 03:00:00', '[)'),
    tstzrange('2020-02-02 02:00:00',  null,                 '[)')
  ),
  array[
    tstzrange('2020-01-01 01:00:00', '2020-02-02 02:00:00', '[)')
  ]
);

-- case : A <= C <= D <= B (the hard case)

select is(
  timeline_valid_time_subtract(
    tstzrange('2020-01-01 01:00:00', '2020-04-04 04:00:00', '[)'),
    tstzrange('2020-02-02 02:00:00', '2020-03-03 03:00:00', '[)')
  ),
  array[
    tstzrange('2020-01-01 01:00:00', '2020-02-02 02:00:00', '[)'),
    tstzrange('2020-03-03 03:00:00', '2020-04-04 04:00:00', '[)')
  ]
);

select is(
  timeline_valid_time_subtract(
    tstzrange('2020-01-01 01:00:00',  null,                 '[)'),
    tstzrange('2020-02-02 02:00:00', '2020-03-03 03:00:00', '[)')
  ),
  array[
    tstzrange('2020-01-01 01:00:00', '2020-02-02 02:00:00', '[)'),
    tstzrange('2020-03-03 03:00:00',  null,                 '[)')
  ]
);

-- case : C <= A <= B <= D

select is(
  timeline_valid_time_subtract(
    tstzrange('2020-02-02 02:00:00', '2020-03-03 03:00:00', '[)'),
    tstzrange('2020-01-01 01:00:00', '2020-04-04 04:00:00', '[)')
  ),
  array[
    'empty'::tstzrange
  ]
);

select is(
  timeline_valid_time_subtract(
    tstzrange('2020-02-02 02:00:00', '2020-03-03 03:00:00', '[)'),
    tstzrange('2020-01-01 01:00:00',  null,                 '[)')
  ),
  array[
    'empty'::tstzrange
  ]
);

-- case : C <= A <= D <= B

select is(
  timeline_valid_time_subtract(
    tstzrange('2020-02-02 02:00:00', '2020-04-04 04:00:00', '[)'),
    tstzrange('2020-01-01 01:00:00', '2020-03-03 03:00:00', '[)')
  ),
  array[
    tstzrange('2020-03-03 03:00:00', '2020-04-04 04:00:00', '[)')
  ]
);

select is(
  timeline_valid_time_subtract(
    tstzrange('2020-02-02 02:00:00', null,                  '[)'),
    tstzrange('2020-01-01 01:00:00', '2020-03-03 03:00:00', '[)')
  ),
  array[
    tstzrange('2020-03-03 03:00:00', null,                  '[)')
  ]
);

-- case : C <= D <= A <= B

select is(
  timeline_valid_time_subtract(
    tstzrange('2020-03-03 03:00:00', '2020-04-04 04:00:00', '[)'),
    tstzrange('2020-01-01 01:00:00', '2020-02-02 02:00:00', '[)')
  ),
  array[
    tstzrange('2020-03-03 03:00:00', '2020-04-04 04:00:00', '[)')
  ]
);

select is(
  timeline_valid_time_subtract(
    tstzrange('2020-03-03 03:00:00',  null,                 '[)'),
    tstzrange('2020-01-01 01:00:00', '2020-02-02 02:00:00', '[)')
  ),
  array[
    tstzrange('2020-03-03 03:00:00',  null,                 '[)')
  ]
);

-- case : A <= C <= (B = D = inf)

select is(
  timeline_valid_time_subtract(
    tstzrange('2020-01-01 01:00:00', null, '[)'),
    tstzrange('2020-02-02 02:00:00', null, '[)')
  ),
  array[
    tstzrange('2020-01-01 01:00:00', '2020-02-02 02:00:00', '[)')
  ]
);

-- case : C <= A <= (B = D = inf)

select is(
  timeline_valid_time_subtract(
    tstzrange('2020-02-02 02:00:00', null, '[)'),
    tstzrange('2020-01-01 01:00:00', null, '[)')
  ),
  array[
    'empty'::tstzrange
  ]
);

-- noqa: enable=all

select finish();

rollback;
