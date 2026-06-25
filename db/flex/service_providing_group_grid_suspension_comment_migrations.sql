--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-grid-suspension-comment-add-same-party-type-visibility runOnChange:false endDelimiter:;
ALTER TABLE flex.service_providing_group_grid_suspension_comment
DROP CONSTRAINT IF EXISTS
service_providing_group_grid_suspension_comment_visibility_check;

ALTER TABLE flex.service_providing_group_grid_suspension_comment
ADD CONSTRAINT
service_providing_group_grid_suspension_comment_visibility_check
CHECK (
    visibility IN (
        'same_party',
        'same_party_type',
        'any_involved_party'
    )
);
