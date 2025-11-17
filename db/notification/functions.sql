--liquibase formatted sql

-- changeset flex:notification-service-provider-product-application-ready-for-market-function runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION
notification.sp_product_application_ready_for_market_check(sppa record)
RETURNS boolean
SECURITY INVOKER
IMMUTABLE
LANGUAGE plpgsql
AS
$$
BEGIN
    RETURN flex.sp_product_application_ready_for_market_check(sppa);
END;
$$;

-- changeset flex:notification-service-providing-group-grid-prequalification-ready-for-market-function runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION
notification.spg_grid_prequalification_ready_for_market_check(spggp record)
RETURNS boolean
SECURITY INVOKER
IMMUTABLE
LANGUAGE plpgsql
AS
$$
BEGIN
    RETURN flex.spg_grid_prequalification_ready_for_market_check(spggp);
END;
$$;

-- changeset flex:notification-service-providing-group-product-application-ready-for-market-function runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION
notification.spg_product_application_ready_for_market_check(spgpa record)
RETURNS boolean
SECURITY INVOKER
IMMUTABLE
LANGUAGE plpgsql
AS
$$
BEGIN
    RETURN flex.spg_product_application_ready_for_market_check(spgpa);
END;
$$;
