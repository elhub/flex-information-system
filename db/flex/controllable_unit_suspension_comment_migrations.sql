--liquibase formatted sql
-- Manually managed file

-- changeset flex:controllable-unit-suspension-comment-add-same-party-type-visibility runOnChange:false endDelimiter:;
ALTER TABLE flex.controllable_unit_suspension_comment
DROP CONSTRAINT IF EXISTS
controllable_unit_suspension_comment_visibility_check;

ALTER TABLE flex.controllable_unit_suspension_comment
ADD CONSTRAINT
controllable_unit_suspension_comment_visibility_check
CHECK (
    visibility IN (
        'same_party',
        'same_party_type',
        'any_involved_party'
    )
);
