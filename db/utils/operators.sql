--liquibase formatted sql

-- changeset flex:utils-create-schema
CREATE SCHEMA IF NOT EXISTS utils;

-- changeset flex:utils-reverse-regexp-like runOnChange:true endDelimiter:;
CREATE OR REPLACE FUNCTION utils.reverse_regexp_like(text, text)
RETURNS boolean
AS $$
    SELECT $2 ~ $1
$$ LANGUAGE sql;

-- just the regular regexp operator with flipped arguments, because the syntax
-- for ALL/ANY requires the array value to be the right argument, so the pattern
-- we check it against has to be on the left hand side
-- cf https://dba.stackexchange.com/questions/228235/match-string-pattern-to-any-array-element
CREATE OPERATOR #~ ( -- noqa
    LEFTARG = text,
    RIGHTARG = text,
    PROCEDURE = utils.reverse_regexp_like
);
