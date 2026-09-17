package no.elhub.flex.serviceprovidinggroup.db

// language="PostgreSQL"
const val GET_GRID_PREQUALIFICATION_FOR_EACH_CU = """
SELECT
    cu.id as cu_id,
    cu.name as cu_name,
    spggp.id as grid_prequalification_id,
    CASE WHEN
             spggp.status IN ('approved', 'conditionally_approved')
                 AND lower(member.record_time_range) <= spggp.prequalified_at
             THEN spggp.prequalified_at END as grid_prequalification_prequalified_at
FROM flex.controllable_unit cu
         JOIN flex.service_providing_group_membership member
              ON member.controllable_unit_id = cu.id
                  AND member.service_providing_group_id = :spgId
         JOIN flex.accounting_point ap ON ap.id = cu.accounting_point_id
         JOIN flex.accounting_point_system_operator apso ON apso.accounting_point_id = ap.id
         LEFT JOIN flex.service_providing_group_grid_prequalification spggp
                   ON spggp.service_providing_group_id = :spgId
                       AND spggp.impacted_system_operator_id = apso.system_operator_id
WHERE cu.id IN (select member.controllable_unit_id FROM flex.service_providing_group_membership member WHERE service_providing_group_id = :spgId);
"""

// language="PostgreSQL"
const val GET_PRODUCT_APPLICATIONS_FOR_EACH_CU = """
SELECT
    cu.id as cu_id,
    spgpa.id as product_application_id,
    CASE WHEN
             spgpa.status IN ('prequalified', 'verified')
                 AND (
                 lower(member.record_time_range) <= spgpa.prequalified_at
                     OR lower(member.record_time_range) <= spgpa.verified_at
                 )
             THEN coalesce(spgpa.verified_at, spgpa.prequalified_at) END as product_application_prequalified_at
FROM flex.controllable_unit cu
         JOIN flex.service_providing_group_membership member
              ON member.controllable_unit_id = cu.id
                  AND member.service_providing_group_id = :spgId
         LEFT JOIN flex.service_providing_group_product_application spgpa
                   ON spgpa.service_providing_group_id = :spgId
WHERE cu.id IN (select member.controllable_unit_id FROM flex.service_providing_group_membership member WHERE service_providing_group_id = :spgId);
"""
