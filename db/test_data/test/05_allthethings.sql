set client_min_messages to notice;

begin;
select no_plan();

-- email_to_name
select is(
    email_to_name('john.doe@example.test'::text),
    'John Doe'::text,
    'john.doe should be John Doe'::text
);

-- ensure that we are throwing errors on bad emails
select throws_like(
    'SELECT email_to_name(''john.doe.me@example.test'')',
    'Invalid email: %'
);

select throws_like(
    'SELECT email_to_name(''john.doe@flex.eu'')',
    'Invalid email: %'
);

select throws_like(
    'SELECT email_to_name(''john@example.test'')',
    'Invalid email: %'
);

select throws_like(
    'SELECT email_to_name(''john'')',
    'Invalid email: %'
);

select finish();
rollback;
