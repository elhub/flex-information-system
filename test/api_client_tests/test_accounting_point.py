from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    AccountingPointResponse,
    ControllableUnitCreateRequest,
    ControllableUnitRegulationDirection,
    ControllableUnitResponse,
    ControllableUnitServiceProviderCreateRequest,
    ControllableUnitServiceProviderResponse,
    ErrorMessage,
    SystemOperatorProductTypeCreateRequest,
    SystemOperatorProductTypeResponse,
    ServiceProvidingGroupBiddingZone,
    ServiceProvidingGroupCreateRequest,
    ServiceProvidingGroupGridPrequalificationCreateRequest,
    ServiceProvidingGroupGridPrequalificationResponse,
    ServiceProvidingGroupMembershipCreateRequest,
    ServiceProvidingGroupMembershipResponse,
    ServiceProvidingGroupProductApplicationCreateRequest,
    ServiceProvidingGroupProductApplicationResponse,
    ServiceProvidingGroupResponse,
    ServiceProvidingGroupStatus,
    ServiceProvidingGroupUpdateRequest,
    ServiceProviderProductApplicationCreateRequest,
    ServiceProviderProductApplicationResponse,
    ServiceProviderProductApplicationStatus,
    ServiceProviderProductApplicationUpdateRequest,
)
from flex.api.accounting_point import (
    list_accounting_point,
    read_accounting_point,
)
from flex.api.system_operator_product_type import create_system_operator_product_type
from flex.api.controllable_unit import create_controllable_unit
from flex.api.controllable_unit_service_provider import (
    create_controllable_unit_service_provider,
)
from flex.api.service_providing_group import (
    create_service_providing_group,
    update_service_providing_group,
)
from flex.api.service_providing_group_grid_prequalification import (
    create_service_providing_group_grid_prequalification,
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


def test_accounting_point_anon(sts):
    client = sts.get_client()

    ap = list_accounting_point.sync(client=client, business_id="eq.133700000000010014")
    assert isinstance(ap, ErrorMessage)


# RLS: AP-FISO001
def test_ap_fiso(sts):
    # FISO can read all accounting points in test data
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # endpoint: GET /accounting_point
    aps = list_accounting_point.sync(client=client_fiso, limit="10000")
    assert isinstance(aps, list)
    assert len(aps) == 3000


# RLS: AP-SO001
def test_ap_so(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # CSO path: Test SO is CSO for APs 1001-2000 (via its MGA in test data)
    client_so = sts.get_client(TestEntity.TEST, "SO")

    # SO can see an AP in its MGA
    # endpoint: GET /accounting_point/{id}
    ap = read_accounting_point.sync(client=client_so, id=1001)
    assert isinstance(ap, AccountingPointResponse)

    # SO cannot see an AP outside its MGA
    ap = read_accounting_point.sync(client=client_so, id=500)
    assert isinstance(ap, ErrorMessage)

    # ISO path: this fresh SO will be the ISO
    client_iso = sts.fresh_client(TestEntity.TEST, "SO")
    iso_id = sts.get_userinfo(client_iso)["party_id"]

    # Set up a CU on AP 1004 and add it to an SPG, then create a grid
    # prequalification designating the SO as ISO
    cu_iso = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="TEST-AP-SO-ISO-CU",
            accounting_point_id=1004,
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_active_power=1.0,
        ),
    )
    assert isinstance(cu_iso, ControllableUnitResponse)

    client_sp = sts.get_client(TestEntity.TEST, "SP")
    sp_id = sts.get_userinfo(client_sp)["party_id"]
    spg_iso = create_service_providing_group.sync(
        client=client_fiso,
        body=ServiceProvidingGroupCreateRequest(
            service_provider_id=sp_id,
            name="TEST-AP-SO-ISO-SPG",
            bidding_zone=ServiceProvidingGroupBiddingZone.NO3,
        ),
    )
    assert isinstance(spg_iso, ServiceProvidingGroupResponse)

    client_eu = sts.get_client(TestEntity.TEST, "EU")
    eu_id = sts.get_userinfo(client_eu)["party_id"]
    cu_sp_iso = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cast(int, cu_iso.id),
            service_provider_id=sp_id,
            end_user_id=eu_id,
            contract_reference="TEST-AP-ISO-CONTRACT",
            valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
        ),
    )
    assert isinstance(cu_sp_iso, ControllableUnitServiceProviderResponse)

    spgm_iso = create_service_providing_group_membership.sync(
        client=client_sp,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cast(int, cu_iso.id),
            service_providing_group_id=cast(int, spg_iso.id),
            valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
        ),
    )
    assert isinstance(spgm_iso, ServiceProvidingGroupMembershipResponse)

    spggp = create_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        body=ServiceProvidingGroupGridPrequalificationCreateRequest(
            service_providing_group_id=cast(int, spg_iso.id),
            impacted_system_operator_id=iso_id,
        ),
    )
    assert isinstance(spggp, ServiceProvidingGroupGridPrequalificationResponse)

    # ISO can now see the AP via the grid prequalification link
    ap = read_accounting_point.sync(client=client_so, id=1004)
    assert isinstance(ap, AccountingPointResponse)

    # PSO path: this fresh SO will be the PSO
    client_pso = sts.fresh_client(TestEntity.TEST, "SO")
    pso_id = sts.get_userinfo(client_pso)["party_id"]

    # Set up a CU on AP 1005, add it to an SPG, and create a product application
    # targeting the SO as PSO
    cu_pso = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="TEST-AP-SO-PSO-CU",
            accounting_point_id=1005,
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_active_power=1.0,
        ),
    )
    assert isinstance(cu_pso, ControllableUnitResponse)

    spg_pso = create_service_providing_group.sync(
        client=client_fiso,
        body=ServiceProvidingGroupCreateRequest(
            service_provider_id=sp_id,
            name="TEST-AP-SO-PSO-SPG",
            bidding_zone=ServiceProvidingGroupBiddingZone.NO3,
        ),
    )
    assert isinstance(spg_pso, ServiceProvidingGroupResponse)

    cu_sp_pso = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cast(int, cu_pso.id),
            service_provider_id=sp_id,
            end_user_id=eu_id,
            contract_reference="TEST-AP-PSO-CONTRACT",
            valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
        ),
    )
    assert isinstance(cu_sp_pso, ControllableUnitServiceProviderResponse)

    spgm_pso = create_service_providing_group_membership.sync(
        client=client_sp,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cast(int, cu_pso.id),
            service_providing_group_id=cast(int, spg_pso.id),
            valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
        ),
    )
    assert isinstance(spgm_pso, ServiceProvidingGroupMembershipResponse)

    u = update_service_providing_group.sync(
        client=client_fiso,
        id=cast(int, spg_pso.id),
        body=ServiceProvidingGroupUpdateRequest(
            status=ServiceProvidingGroupStatus.ACTIVE,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # activate product type for the SO
    sopt = create_system_operator_product_type.sync(
        client=client_fiso,
        body=SystemOperatorProductTypeCreateRequest(
            system_operator_id=pso_id,
            product_type_id=1,
        ),
    )
    assert isinstance(sopt, SystemOperatorProductTypeResponse)

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
            service_providing_group_id=cast(int, spg_pso.id),
            procuring_system_operator_id=pso_id,
            product_type_ids=[1],
            maximum_active_power_up=1.0,
            maximum_active_power_down=1.0,
        ),
    )
    assert isinstance(spgpa, ServiceProvidingGroupProductApplicationResponse)

    # PSO can now see the AP via the SPG product application link
    ap = read_accounting_point.sync(client=client_pso, id=1005)
    assert isinstance(ap, AccountingPointResponse)


# RLS: AP-SP001
def test_ap_sp(sts):
    # in test data, SP manages CUs on APs 1001-1003
    # SP should be able to see those APs
    client_sp = sts.get_client(TestEntity.TEST, "SP")

    # SP can read the AP by ID
    ap = read_accounting_point.sync(client=client_sp, id=1001)
    assert isinstance(ap, AccountingPointResponse)

    # a fresh SP cannot read it
    client_fresh_sp = sts.fresh_client(TestEntity.TEST, "SP")
    fresh_sp_id = sts.get_userinfo(client_fresh_sp)["party_id"]

    ap = read_accounting_point.sync(client=client_fresh_sp, id=1001)
    assert isinstance(ap, ErrorMessage)

    # After granting a CUSP contract to the SP on an AP, they should see it
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    cu = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="TEST-AP-SP001-CU",
            accounting_point_id=1006,
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_active_power=1.0,
        ),
    )
    assert isinstance(cu, ControllableUnitResponse)

    client_eu = sts.get_client(TestEntity.TEST, "EU")
    eu_id = sts.get_userinfo(client_eu)["party_id"]

    cu_sp = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_provider_id=fresh_sp_id,
            end_user_id=eu_id,
            contract_reference="TEST-AP-SP001-CONTRACT",
            valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
        ),
    )
    assert isinstance(cu_sp, ControllableUnitServiceProviderResponse)

    ap = read_accounting_point.sync(client=client_fresh_sp, id=1006)
    assert isinstance(ap, AccountingPointResponse)
