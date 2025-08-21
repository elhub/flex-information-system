--liquibase formatted sql
-- Manually managed file

-- changeset flex:create-scope-domain endDelimiter:-- runOnChange:false
CREATE DOMAIN flex.scope AS text
CONSTRAINT check_scope_regex
CHECK (
    value ~ '^((read)|(use)|(manage)):((auth)|(data))(:[a-z_]+(:[a-z_]+)?)?$'
);

-- changeset flex:validate-scope endDelimiter:; runOnChange:true
ALTER DOMAIN flex.scope
DROP CONSTRAINT IF EXISTS check_scope_resource;
ALTER DOMAIN flex.scope
ADD CONSTRAINT check_scope_resource CHECK (
    split_part(value, ':', 3) IN (
        '', -- no resource in scope is ok
        'accounting_point',
        'accounting_point_balance_responsible_party',
        'accounting_point_energy_supplier',
        'controllable_unit',
        'controllable_unit_history',
        'controllable_unit_service_provider',
        'controllable_unit_service_provider_history',
        'entity',
        'entity_client',
        'event',
        'identity',
        'notice',
        'notification',
        'party',
        'party_history',
        'party_membership',
        'party_membership_history',
        'product_type',
        'service_provider_product_application',
        'service_provider_product_application_history',
        'service_provider_product_application_comment',
        'service_provider_product_application_comment_history',
        'service_providing_group',
        'service_providing_group_history',
        'service_providing_group_grid_prequalification',
        'service_providing_group_grid_prequalification_history',
        'service_providing_group_membership',
        'service_providing_group_membership_history',
        'service_providing_group_product_application',
        'service_providing_group_product_application_history',
        'system_operator_product_type',
        'system_operator_product_type_history',
        'technical_resource',
        'technical_resource_history'
    )
);
ALTER DOMAIN flex.scope
DROP CONSTRAINT IF EXISTS check_scope_operation;
ALTER DOMAIN flex.scope
ADD CONSTRAINT check_scope_operation CHECK (
    split_part(value, ':', 4) = ''
    OR (
        split_part(value, ':', 4) = 'lookup'
        AND split_part(value, ':', 3) IN (
            'controllable_unit',
            'entity'
        )
    )
);
