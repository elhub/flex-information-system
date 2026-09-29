--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-product-application-terminate-orphaned-function runOnChange:true endDelimiter:--
-- terminate SPGPAs whose SPG no longer has any currently active CUs
-- (this catches memberships whose valid time ends naturally)
CREATE OR REPLACE FUNCTION
flex.service_providing_group_product_application_terminate_orphaned()
RETURNS void
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
BEGIN
    UPDATE flex.service_providing_group_product_application AS spgpa
    SET status = 'terminated'
    WHERE spgpa.status != 'terminated'
    AND NOT EXISTS (
        SELECT 1
        FROM flex.service_providing_group_membership AS spgm
        WHERE spgm.service_providing_group_id = spgpa.service_providing_group_id
        AND (
            upper(spgm.valid_time_range) IS null
            OR upper(spgm.valid_time_range) > current_timestamp
        )
    );
END;
$$;

-- changeset flex:service-providing-group-product-application-terminate-orphaned-job runOnChange:false endDelimiter:;
SELECT cron.schedule(
    'service-providing-group-product-application-terminate-orphaned',
    '52 * * * *', -- every hour at minute 52
    $$SELECT flex.service_providing_group_product_application_terminate_orphaned()$$
);
