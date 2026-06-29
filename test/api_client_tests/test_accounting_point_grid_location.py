from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    AccountingPointGridLocationResponse,
    AccountingPointGridLocationHistoryResponse,
    AccountingPointGridLocationCreateRequest,
    AccountingPointGridLocationUpdateRequest,
    AccountingPointGridLocationObjectType,
    AccountingPointGridLocationQuality,
    ControllableUnitCreateRequest,
    ControllableUnitResponse,
    ControllableUnitRegulationDirection,
    ControllableUnitServiceProviderCreateRequest,
    ControllableUnitServiceProviderResponse,
    ServiceProvidingGroupCreateRequest,
    ServiceProvidingGroupUpdateRequest,
    ServiceProvidingGroupResponse,
    ServiceProvidingGroupStatus,
    ServiceProvidingGroupBiddingZone,
    ServiceProvidingGroupProductApplicationCreateRequest,
    ServiceProvidingGroupProductApplicationRampingCapability,
    ServiceProvidingGroupProductApplicationResponse,
    ServiceProvidingGroupMembershipCreateRequest,
    ServiceProvidingGroupMembershipResponse,
    ServiceProviderProductApplicationCreateRequest,
    ServiceProviderProductApplicationUpdateRequest,
    ServiceProviderProductApplicationStatus,
    ServiceProviderProductApplicationResponse,
    ErrorMessage,
)
from flex.api.accounting_point_grid_location import (
    create_accounting_point_grid_location,
    read_accounting_point_grid_location,
    update_accounting_point_grid_location,
    list_accounting_point_grid_location,
    list_accounting_point_grid_location_history,
    read_accounting_point_grid_location_history,
)
from flex.api.controllable_unit import (
    create_controllable_unit,
)
from flex.api.controllable_unit_service_provider import (
    create_controllable_unit_service_provider,
)
from flex.api.service_providing_group import (
    create_service_providing_group,
    update_service_providing_group,
)
from flex.api.service_providing_group_membership import (
    create_service_providing_group_membership,
)
from flex.api.service_providing_group_product_application import (
    create_service_providing_group_product_application,
)
from flex.api.service_provider_product_application import (
    create_service_provider_product_application,
    update_service_provider_product_application,
)
from typing import cast
import datetime
import pytest


@pytest.fixture
def sts():
    yield SecurityTokenService()


def _base_create_request(
    accounting_point_id: int,
) -> AccountingPointGridLocationCreateRequest:
    return AccountingPointGridLocationCreateRequest(
        accounting_point_id=accounting_point_id,
        object_type=AccountingPointGridLocationObjectType.SUBSTATION,
        business_id="b1000001-0000-4000-8000-000000000011",
        name="Test Substation",
        nominal_voltage=22.0,
        quality=AccountingPointGridLocationQuality.CONFIRMED,
    )


# RLS: APGL-FISO001
def test_apgl_fiso(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # endpoint: GET /accounting_point_grid_location
    apgls = list_accounting_point_grid_location.sync(client=client_fiso)
    assert isinstance(apgls, list)

    # endpoint: POST /accounting_point_grid_location
    apgl = create_accounting_point_grid_location.sync(
        client=client_fiso,
        body=_base_create_request(1001),
    )
    assert isinstance(apgl, AccountingPointGridLocationResponse)
    assert apgl.accounting_point_id == 1001
    assert apgl.object_type == AccountingPointGridLocationObjectType.SUBSTATION
    assert apgl.quality == AccountingPointGridLocationQuality.CONFIRMED

    # endpoint: GET /accounting_point_grid_location/{id}
    apgl = read_accounting_point_grid_location.sync(
        client=client_fiso,
        id=cast(int, apgl.id),
    )
    assert isinstance(apgl, AccountingPointGridLocationResponse)

    # endpoint: GET /accounting_point_grid_location_history
    hist = list_accounting_point_grid_location_history.sync(
        client=client_fiso,
        accounting_point_grid_location_id=f"eq.{apgl.id}",
    )
    assert isinstance(hist, list)
    hist_size = len(hist)

    # endpoint: PATCH /accounting_point_grid_location/{id}
    u = update_accounting_point_grid_location.sync(
        client=client_fiso,
        id=cast(int, apgl.id),
        body=AccountingPointGridLocationUpdateRequest(
            quality=AccountingPointGridLocationQuality.GUESSED,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # history should have grown by one
    hist = list_accounting_point_grid_location_history.sync(
        client=client_fiso,
        accounting_point_grid_location_id=f"eq.{apgl.id}",
    )
    assert isinstance(hist, list)
    assert len(hist) == hist_size + 1

    # endpoint: GET /accounting_point_grid_location_history/{id}
    h = read_accounting_point_grid_location_history.sync(
        client=client_fiso,
        id=cast(int, hist[0].id),
    )
    assert isinstance(h, AccountingPointGridLocationHistoryResponse)


# RLS: APGL-SO001 (CSO path)
def test_apgl_so_cso(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    client_so = sts.get_client(TestEntity.TEST, "SO")

    # Test SO is CSO for APs 1001-2000

    # Create an APGL on an AP in Test SO's MGA
    apgl = create_accounting_point_grid_location.sync(
        client=client_fiso,
        body=_base_create_request(1002),
    )
    assert isinstance(apgl, AccountingPointGridLocationResponse)

    # SO can list and see it
    apgls_so = list_accounting_point_grid_location.sync(
        client=client_so,
        accounting_point_id="eq.1002",
    )
    assert isinstance(apgls_so, list)
    assert len(apgls_so) == 1

    # SO can read it by ID
    apgl_so = read_accounting_point_grid_location.sync(
        client=client_so,
        id=cast(int, apgl.id),
    )
    assert isinstance(apgl_so, AccountingPointGridLocationResponse)

    # SO can update it
    u = update_accounting_point_grid_location.sync(
        client=client_so,
        id=cast(int, apgl.id),
        body=AccountingPointGridLocationUpdateRequest(
            name="Updated by SO",
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # SO cannot see APGLs for APs outside its MGA (AP 500 is outside 1000-2000)
    apgls_outside = list_accounting_point_grid_location.sync(
        client=client_so,
        accounting_point_id="eq.500",
    )
    assert isinstance(apgls_outside, list)
    assert len(apgls_outside) == 0


# RLS: APGL-SO001 (PSO)
def test_apgl_so_procuring(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # Common SO is not PSO for any AP in test data to start with
    client_pso = sts.get_client(TestEntity.COMMON, "SO")
    pso_id = sts.get_userinfo(client_pso)["party_id"]

    # Confirm PSO cannot see any APGLs before setup
    apgls_before = list_accounting_point_grid_location.sync(
        client=client_pso,
        accounting_point_id="eq.1003",
    )
    assert isinstance(apgls_before, list)
    assert len(apgls_before) == 0

    # Create APGL on AP 1003
    apgl = create_accounting_point_grid_location.sync(
        client=client_fiso,
        body=_base_create_request(1003),
    )
    assert isinstance(apgl, AccountingPointGridLocationResponse)

    # Set up a CU on AP 1003, add it to an SPG, and create a product application
    # targeting Common SO as the procuring system operator
    cu = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="TEST-APGL-SO-PROCURING-CU",
            accounting_point_id=1003,
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_active_power=1.0,
        ),
    )
    assert isinstance(cu, ControllableUnitResponse)

    client_sp = sts.get_client(TestEntity.TEST, "SP")
    sp_id = sts.get_userinfo(client_sp)["party_id"]
    spg = create_service_providing_group.sync(
        client=client_fiso,
        body=ServiceProvidingGroupCreateRequest(
            service_provider_id=sp_id,
            name="TEST-APGL-SO-PROCURING-SPG",
            bidding_zone=ServiceProvidingGroupBiddingZone.NO3,
        ),
    )
    assert isinstance(spg, ServiceProvidingGroupResponse)

    client_eu = sts.get_client(TestEntity.TEST, "EU")
    eu_id = sts.get_userinfo(client_eu)["party_id"]
    cu_sp = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_provider_id=sp_id,
            end_user_id=eu_id,
            contract_reference="TEST-APGL-CONTRACT",
            valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
        ),
    )
    assert isinstance(cu_sp, ControllableUnitServiceProviderResponse)

    spgm = create_service_providing_group_membership.sync(
        client=client_sp,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_providing_group_id=cast(int, spg.id),
            valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
        ),
    )
    assert isinstance(spgm, ServiceProvidingGroupMembershipResponse)

    # Activate the SPG (required before creating a product application)
    u = update_service_providing_group.sync(
        client=client_fiso,
        id=cast(int, spg.id),
        body=ServiceProvidingGroupUpdateRequest(
            status=ServiceProvidingGroupStatus.ACTIVE,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # Product type 1 (Manual Congestion) is already active for Common SO in test data.
    sppa = create_service_provider_product_application.sync(
        client=client_sp,
        body=ServiceProviderProductApplicationCreateRequest(
            service_provider_id=sp_id,
            system_operator_id=pso_id,
            product_type_ids=[1],
        ),
    )
    assert isinstance(sppa, ServiceProviderProductApplicationResponse)

    u = update_service_provider_product_application.sync(
        client=client_pso,
        id=cast(int, sppa.id),
        body=ServiceProviderProductApplicationUpdateRequest(
            status=ServiceProviderProductApplicationStatus.QUALIFIED,
            qualified_at=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
        ),
    )
    assert not isinstance(u, ErrorMessage)

    spgpa = create_service_providing_group_product_application.sync(
        client=client_sp,
        body=ServiceProvidingGroupProductApplicationCreateRequest(
            service_providing_group_id=cast(int, spg.id),
            procuring_system_operator_id=pso_id,
            product_type_ids=[1],
            maximum_active_power_up=1.0,
            maximum_active_power_down=1.0,
            ramping_capability=ServiceProvidingGroupProductApplicationRampingCapability.NEVER,
            ramping_description="No ramping capability",
        ),
    )
    assert isinstance(spgpa, ServiceProvidingGroupProductApplicationResponse)

    # PSO can now see the APGL via the SPG product application link
    apgls_after = list_accounting_point_grid_location.sync(
        client=client_pso,
        accounting_point_id="eq.1003",
    )
    assert isinstance(apgls_after, list)
    assert any(a.id == apgl.id for a in apgls_after)


def test_rla_absence(sts):
    # These roles have no RLS policy on accounting_point_grid_location,
    # so they receive a permission denied error rather than an empty list
    roles_without_access = ["BRP", "EU", "ES", "MO", "SP", "TP"]

    for role in roles_without_access:
        result = list_accounting_point_grid_location.sync(
            client=sts.get_client(TestEntity.TEST, role),
        )
        assert isinstance(result, ErrorMessage)

    # anonymous also gets an error
    result = list_accounting_point_grid_location.sync(client=sts.get_client())
    assert isinstance(result, ErrorMessage)


# Validation tests
#
# Enum constraint tests (object_type, source, quality) use the PATCH endpoint
# to send invalid values, because the typed create client always serialises the
# enum field from the typed attribute.
# A valid record is created first on the designated AP, then the invalid PATCH
# is attempted.


def test_apgl_validation_object_type(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    apgl = create_accounting_point_grid_location.sync(
        client=client_fiso,
        body=_base_create_request(1004),
    )
    assert isinstance(apgl, AccountingPointGridLocationResponse)

    req = AccountingPointGridLocationUpdateRequest()
    req.additional_properties["object_type"] = "invalid_type"

    result = update_accounting_point_grid_location.sync(
        client=client_fiso,
        id=cast(int, apgl.id),
        body=req,
    )
    assert isinstance(result, ErrorMessage)


def test_apgl_validation_name_too_long(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    result = create_accounting_point_grid_location.sync(
        client=client_fiso,
        body=AccountingPointGridLocationCreateRequest(
            accounting_point_id=1005,
            object_type=AccountingPointGridLocationObjectType.SUBSTATION,
            business_id="b1000001-0000-4000-8000-000000000011",
            name="x" * 513,
            nominal_voltage=22.0,
            quality=AccountingPointGridLocationQuality.CONFIRMED,
        ),
    )
    assert isinstance(result, ErrorMessage)


def test_apgl_validation_nominal_voltage_negative(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    result = create_accounting_point_grid_location.sync(
        client=client_fiso,
        body=AccountingPointGridLocationCreateRequest(
            accounting_point_id=1006,
            object_type=AccountingPointGridLocationObjectType.SUBSTATION,
            business_id="b1000001-0000-4000-8000-000000000011",
            name="Test",
            nominal_voltage=-1.0,
            quality=AccountingPointGridLocationQuality.CONFIRMED,
        ),
    )
    assert isinstance(result, ErrorMessage)


def test_apgl_validation_source(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    apgl = create_accounting_point_grid_location.sync(
        client=client_fiso,
        body=_base_create_request(1007),
    )
    assert isinstance(apgl, AccountingPointGridLocationResponse)

    req = AccountingPointGridLocationUpdateRequest()
    req.additional_properties["source"] = "invalid_source"

    result = update_accounting_point_grid_location.sync(
        client=client_fiso,
        id=cast(int, apgl.id),
        body=req,
    )
    assert isinstance(result, ErrorMessage)


def test_apgl_validation_quality(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    apgl = create_accounting_point_grid_location.sync(
        client=client_fiso,
        body=_base_create_request(1008),
    )
    assert isinstance(apgl, AccountingPointGridLocationResponse)

    req = AccountingPointGridLocationUpdateRequest()
    req.additional_properties["quality"] = "invalid_quality"

    result = update_accounting_point_grid_location.sync(
        client=client_fiso,
        id=cast(int, apgl.id),
        body=req,
    )
    assert isinstance(result, ErrorMessage)


def test_apgl_validation_business_id_missing(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # Create a valid record first, then PATCH with business_id=null,
    # which violates the NOT NULL constraint on the column.
    apgl = create_accounting_point_grid_location.sync(
        client=client_fiso,
        body=_base_create_request(1009),
    )
    assert isinstance(apgl, AccountingPointGridLocationResponse)

    req = AccountingPointGridLocationUpdateRequest()
    req.additional_properties["business_id"] = None

    result = update_accounting_point_grid_location.sync(
        client=client_fiso,
        id=cast(int, apgl.id),
        body=req,
    )
    assert isinstance(result, ErrorMessage)


def test_apgl_validation_business_id_not_in_db(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # A well-formed UUID that does not exist in the substation table.
    result = create_accounting_point_grid_location.sync(
        client=client_fiso,
        body=AccountingPointGridLocationCreateRequest(
            accounting_point_id=1010,
            object_type=AccountingPointGridLocationObjectType.SUBSTATION,
            business_id="00000000-0000-4000-8000-000000000000",
            name="Test",
            nominal_voltage=22.0,
            quality=AccountingPointGridLocationQuality.CONFIRMED,
        ),
    )
    assert isinstance(result, ErrorMessage)
