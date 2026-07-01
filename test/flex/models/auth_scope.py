from enum import StrEnum


class AuthScope(StrEnum):
    MANAGEAUTH = "manage:auth"
    MANAGEDATA = "manage:data"
    MANAGEDATAACCOUNTING_POINT_GRID_LOCATION = "manage:data:accounting_point_grid_location"
    MANAGEDATACONTROLLABLE_UNIT = "manage:data:controllable_unit"
    MANAGEDATACONTROLLABLE_UNIT_SERVICE_PROVIDER = "manage:data:controllable_unit_service_provider"
    MANAGEDATACONTROLLABLE_UNIT_SUSPENSION = "manage:data:controllable_unit_suspension"
    MANAGEDATACONTROLLABLE_UNIT_SUSPENSION_COMMENT = "manage:data:controllable_unit_suspension_comment"
    MANAGEDATAENTITY = "manage:data:entity"
    MANAGEDATAENTITY_CLIENT = "manage:data:entity_client"
    MANAGEDATANOTIFICATION = "manage:data:notification"
    MANAGEDATAPARTY = "manage:data:party"
    MANAGEDATAPARTY_MEMBERSHIP = "manage:data:party_membership"
    MANAGEDATASERVICE_PROVIDER_PRODUCT_APPLICATION = "manage:data:service_provider_product_application"
    MANAGEDATASERVICE_PROVIDER_PRODUCT_APPLICATION_COMMENT = "manage:data:service_provider_product_application_comment"
    MANAGEDATASERVICE_PROVIDER_PRODUCT_SUSPENSION = "manage:data:service_provider_product_suspension"
    MANAGEDATASERVICE_PROVIDER_PRODUCT_SUSPENSION_COMMENT = "manage:data:service_provider_product_suspension_comment"
    MANAGEDATASERVICE_PROVIDING_GROUP = "manage:data:service_providing_group"
    MANAGEDATASERVICE_PROVIDING_GROUP_GRID_PREQUALIFICATION = (
        "manage:data:service_providing_group_grid_prequalification"
    )
    MANAGEDATASERVICE_PROVIDING_GROUP_GRID_PREQUALIFICATION_COMMENT = (
        "manage:data:service_providing_group_grid_prequalification_comment"
    )
    MANAGEDATASERVICE_PROVIDING_GROUP_GRID_SUSPENSION = "manage:data:service_providing_group_grid_suspension"
    MANAGEDATASERVICE_PROVIDING_GROUP_GRID_SUSPENSION_COMMENT = (
        "manage:data:service_providing_group_grid_suspension_comment"
    )
    MANAGEDATASERVICE_PROVIDING_GROUP_MEMBERSHIP = "manage:data:service_providing_group_membership"
    MANAGEDATASERVICE_PROVIDING_GROUP_PRODUCT_APPLICATION = "manage:data:service_providing_group_product_application"
    MANAGEDATASERVICE_PROVIDING_GROUP_PRODUCT_APPLICATION_COMMENT = (
        "manage:data:service_providing_group_product_application_comment"
    )
    MANAGEDATASERVICE_PROVIDING_GROUP_PRODUCT_SUSPENSION = "manage:data:service_providing_group_product_suspension"
    MANAGEDATASERVICE_PROVIDING_GROUP_PRODUCT_SUSPENSION_COMMENT = (
        "manage:data:service_providing_group_product_suspension_comment"
    )
    MANAGEDATASYSTEM_OPERATOR_PRODUCT_TYPE = "manage:data:system_operator_product_type"
    MANAGEDATATECHNICAL_RESOURCE = "manage:data:technical_resource"
    READAUTH = "read:auth"
    READDATA = "read:data"
    READDATAACCOUNTING_POINT = "read:data:accounting_point"
    READDATAACCOUNTING_POINT_BALANCE_RESPONSIBLE_PARTY = "read:data:accounting_point_balance_responsible_party"
    READDATAACCOUNTING_POINT_BIDDING_ZONE = "read:data:accounting_point_bidding_zone"
    READDATAACCOUNTING_POINT_END_USER = "read:data:accounting_point_end_user"
    READDATAACCOUNTING_POINT_ENERGY_SUPPLIER = "read:data:accounting_point_energy_supplier"
    READDATAACCOUNTING_POINT_GRID_LOCATION = "read:data:accounting_point_grid_location"
    READDATAACCOUNTING_POINT_GRID_LOCATION_HISTORY = "read:data:accounting_point_grid_location_history"
    READDATAACCOUNTING_POINT_METERING_GRID_AREA = "read:data:accounting_point_metering_grid_area"
    READDATACONTROLLABLE_UNIT = "read:data:controllable_unit"
    READDATACONTROLLABLE_UNIT_HISTORY = "read:data:controllable_unit_history"
    READDATACONTROLLABLE_UNIT_SERVICE_PROVIDER = "read:data:controllable_unit_service_provider"
    READDATACONTROLLABLE_UNIT_SERVICE_PROVIDER_HISTORY = "read:data:controllable_unit_service_provider_history"
    READDATACONTROLLABLE_UNIT_SUMMARY = "read:data:controllable_unit_summary"
    READDATACONTROLLABLE_UNIT_SUSPENSION = "read:data:controllable_unit_suspension"
    READDATACONTROLLABLE_UNIT_SUSPENSION_COMMENT = "read:data:controllable_unit_suspension_comment"
    READDATACONTROLLABLE_UNIT_SUSPENSION_COMMENT_HISTORY = "read:data:controllable_unit_suspension_comment_history"
    READDATACONTROLLABLE_UNIT_SUSPENSION_HISTORY = "read:data:controllable_unit_suspension_history"
    READDATAENTITY = "read:data:entity"
    READDATAENTITY_CLIENT = "read:data:entity_client"
    READDATAEVENT = "read:data:event"
    READDATAIDENTITY = "read:data:identity"
    READDATAMETERING_GRID_AREA = "read:data:metering_grid_area"
    READDATANOTICE = "read:data:notice"
    READDATANOTIFICATION = "read:data:notification"
    READDATAPARTY = "read:data:party"
    READDATAPARTY_HISTORY = "read:data:party_history"
    READDATAPARTY_MEMBERSHIP = "read:data:party_membership"
    READDATAPARTY_MEMBERSHIP_HISTORY = "read:data:party_membership_history"
    READDATAPRODUCT_TYPE = "read:data:product_type"
    READDATASERVICE_PROVIDER_PRODUCT_APPLICATION = "read:data:service_provider_product_application"
    READDATASERVICE_PROVIDER_PRODUCT_APPLICATION_COMMENT = "read:data:service_provider_product_application_comment"
    READDATASERVICE_PROVIDER_PRODUCT_APPLICATION_COMMENT_HISTORY = (
        "read:data:service_provider_product_application_comment_history"
    )
    READDATASERVICE_PROVIDER_PRODUCT_APPLICATION_HISTORY = "read:data:service_provider_product_application_history"
    READDATASERVICE_PROVIDER_PRODUCT_SUSPENSION = "read:data:service_provider_product_suspension"
    READDATASERVICE_PROVIDER_PRODUCT_SUSPENSION_COMMENT = "read:data:service_provider_product_suspension_comment"
    READDATASERVICE_PROVIDER_PRODUCT_SUSPENSION_COMMENT_HISTORY = (
        "read:data:service_provider_product_suspension_comment_history"
    )
    READDATASERVICE_PROVIDER_PRODUCT_SUSPENSION_HISTORY = "read:data:service_provider_product_suspension_history"
    READDATASERVICE_PROVIDING_GROUP = "read:data:service_providing_group"
    READDATASERVICE_PROVIDING_GROUP_GRID_PREQUALIFICATION = "read:data:service_providing_group_grid_prequalification"
    READDATASERVICE_PROVIDING_GROUP_GRID_PREQUALIFICATION_COMMENT = (
        "read:data:service_providing_group_grid_prequalification_comment"
    )
    READDATASERVICE_PROVIDING_GROUP_GRID_PREQUALIFICATION_COMMENT_HISTORY = (
        "read:data:service_providing_group_grid_prequalification_comment_history"
    )
    READDATASERVICE_PROVIDING_GROUP_GRID_PREQUALIFICATION_HISTORY = (
        "read:data:service_providing_group_grid_prequalification_history"
    )
    READDATASERVICE_PROVIDING_GROUP_GRID_SUSPENSION = "read:data:service_providing_group_grid_suspension"
    READDATASERVICE_PROVIDING_GROUP_GRID_SUSPENSION_COMMENT = (
        "read:data:service_providing_group_grid_suspension_comment"
    )
    READDATASERVICE_PROVIDING_GROUP_GRID_SUSPENSION_COMMENT_HISTORY = (
        "read:data:service_providing_group_grid_suspension_comment_history"
    )
    READDATASERVICE_PROVIDING_GROUP_GRID_SUSPENSION_HISTORY = (
        "read:data:service_providing_group_grid_suspension_history"
    )
    READDATASERVICE_PROVIDING_GROUP_HISTORY = "read:data:service_providing_group_history"
    READDATASERVICE_PROVIDING_GROUP_MEMBERSHIP = "read:data:service_providing_group_membership"
    READDATASERVICE_PROVIDING_GROUP_MEMBERSHIP_HISTORY = "read:data:service_providing_group_membership_history"
    READDATASERVICE_PROVIDING_GROUP_PRODUCT_APPLICATION = "read:data:service_providing_group_product_application"
    READDATASERVICE_PROVIDING_GROUP_PRODUCT_APPLICATION_COMMENT = (
        "read:data:service_providing_group_product_application_comment"
    )
    READDATASERVICE_PROVIDING_GROUP_PRODUCT_APPLICATION_COMMENT_HISTORY = (
        "read:data:service_providing_group_product_application_comment_history"
    )
    READDATASERVICE_PROVIDING_GROUP_PRODUCT_APPLICATION_HISTORY = (
        "read:data:service_providing_group_product_application_history"
    )
    READDATASERVICE_PROVIDING_GROUP_PRODUCT_SUSPENSION = "read:data:service_providing_group_product_suspension"
    READDATASERVICE_PROVIDING_GROUP_PRODUCT_SUSPENSION_COMMENT = (
        "read:data:service_providing_group_product_suspension_comment"
    )
    READDATASERVICE_PROVIDING_GROUP_PRODUCT_SUSPENSION_COMMENT_HISTORY = (
        "read:data:service_providing_group_product_suspension_comment_history"
    )
    READDATASERVICE_PROVIDING_GROUP_PRODUCT_SUSPENSION_HISTORY = (
        "read:data:service_providing_group_product_suspension_history"
    )
    READDATASERVICE_PROVIDING_GROUP_SUMMARY = "read:data:service_providing_group_summary"
    READDATASYSTEM_OPERATOR_PRODUCT_TYPE = "read:data:system_operator_product_type"
    READDATASYSTEM_OPERATOR_PRODUCT_TYPE_HISTORY = "read:data:system_operator_product_type_history"
    READDATATECHNICAL_RESOURCE = "read:data:technical_resource"
    READDATATECHNICAL_RESOURCE_HISTORY = "read:data:technical_resource_history"
    READGRID = "read:grid"
    READGRIDLINE = "read:grid:line"
    READGRIDSUBSTATION = "read:grid:substation"
    READGRIDSUBSTATION_CLUSTER = "read:grid:substation_cluster"
    USEAUTH = "use:auth"
    USEDATA = "use:data"
    USEDATACONTROLLABLE_UNITLOOKUP = "use:data:controllable_unit:lookup"
    USEDATAENTITYLOOKUP = "use:data:entity:lookup"

    def __str__(self) -> str:
        return str(self.value)
