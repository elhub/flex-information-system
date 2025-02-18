from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    ControllableUnitCreateRequest,
    ControllableUnitRegulationDirection,
    ControllableUnitResponse,
    ControllableUnitServiceProviderCreateRequest,
    ControllableUnitServiceProviderResponse,
    ServiceProvidingGroupResponse,
    ServiceProvidingGroupCreateRequest,
    ServiceProvidingGroupUpdateRequest,
    ServiceProvidingGroupHistoryResponse,
    ServiceProvidingGroupMembershipCreateRequest,
    ServiceProvidingGroupMembershipResponse,
    ServiceProvidingGroupStatus,
    ServiceProvidingGroupGridPrequalificationCreateRequest,
    ServiceProvidingGroupGridPrequalificationResponse,
    ErrorMessage,
)
from flex.api.service_providing_group import (
    create_service_providing_group,
    read_service_providing_group,
    update_service_providing_group,
    list_service_providing_group,
    list_service_providing_group_history,
    read_service_providing_group_history,
)
from flex.api.service_providing_group_membership import (
    create_service_providing_group_membership,
)
from flex.api.service_providing_group_grid_prequalification import (
    list_service_providing_group_grid_prequalification,
    create_service_providing_group_grid_prequalification,
)
from flex.api.controllable_unit import create_controllable_unit
from flex.api.controllable_unit_service_provider import (
    create_controllable_unit_service_provider,
)
from typing import cast
import pytest


@pytest.fixture
def sts():
    yield SecurityTokenService()


def test_spg_fiso_sp(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # RLS: SPG-FISO001
    # RLS: SPG-SP001

    # endpoint: GET /service_providing_group
    spgs = list_service_providing_group.sync(client=client_fiso)
    assert isinstance(spgs, list)

    client_sp = sts.get_client(TestEntity.TEST, "SP")

    spgs_sp = list_service_providing_group.sync(client=client_sp)
    assert isinstance(spgs_sp, list)
    assert len(spgs_sp) <= len(spgs)

    sp_id = sts.get_userinfo(client_sp)["party_id"]
    # endpoint: POST /service_providing_group
    spg = create_service_providing_group.sync(
        client=client_fiso,
        body=ServiceProvidingGroupCreateRequest(
            name="TEST-SPG-1",
            service_provider_id=sp_id,
        ),
    )
    assert isinstance(spg, ServiceProvidingGroupResponse)

    spg2 = create_service_providing_group.sync(
        client=client_sp,
        body=ServiceProvidingGroupCreateRequest(
            name="TEST-SPG-3",
            service_provider_id=sp_id,
        ),
    )
    assert isinstance(spg2, ServiceProvidingGroupResponse)

    # endpoint: GET /service_providing_group/{id}
    spg_fiso = read_service_providing_group.sync(
        client=client_fiso, id=cast(int, spg.id)
    )
    assert isinstance(spg_fiso, ServiceProvidingGroupResponse)
    spg_sp = read_service_providing_group.sync(client=client_sp, id=cast(int, spg.id))
    assert isinstance(spg_sp, ServiceProvidingGroupResponse)

    # check SPG grid prequalification resources are created on SPG activation

    cu = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="New CU",
            accounting_point_id="133700000000010014",
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_available_capacity=3.5,
        ),
    )
    assert isinstance(cu, ControllableUnitResponse)

    cu_sp = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_provider_id=sp_id,
            valid_from="2024-01-01T00:00:00+1",
        ),
    )
    assert isinstance(cu_sp, ControllableUnitServiceProviderResponse)

    # before the update, no grid prequalification resources
    spggp = list_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        service_providing_group_id=f"eq.{spg.id}",
    )
    assert isinstance(spggp, list)
    assert len(spggp) == 0

    # cannot activate SPG as it is still empty
    u = update_service_providing_group.sync(
        client=client_sp,
        id=cast(int, spg.id),
        body=ServiceProvidingGroupUpdateRequest(
            status=ServiceProvidingGroupStatus.ACTIVE,
        ),
    )
    assert isinstance(u, ErrorMessage)

    spgm = create_service_providing_group_membership.sync(
        client=client_fiso,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_providing_group_id=cast(int, spg.id),
            valid_from="2024-01-01T00:00:00+1",
        ),
    )
    assert isinstance(spgm, ServiceProvidingGroupMembershipResponse)

    # endpoint: PATCH /service_providing_group/{id}
    u = update_service_providing_group.sync(
        client=client_sp,
        id=cast(int, spg.id),
        body=ServiceProvidingGroupUpdateRequest(
            name="TEST-SPG-1 UPDATED",
            status=ServiceProvidingGroupStatus.ACTIVE,
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    # after the update, one grid prequalification resource
    spggp = list_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        service_providing_group_id=f"eq.{spg.id}",
    )
    assert isinstance(spggp, list)
    assert len(spggp) == 1

    # check status can be un-terminated by FISO
    u = update_service_providing_group.sync(
        client=client_fiso,
        id=cast(int, spg.id),
        body=ServiceProvidingGroupUpdateRequest(
            status=ServiceProvidingGroupStatus.TERMINATED,
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    u = update_service_providing_group.sync(
        client=client_fiso,
        id=cast(int, spg.id),
        body=ServiceProvidingGroupUpdateRequest(
            status=ServiceProvidingGroupStatus.ACTIVE,
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    # check status can be updated but not un-terminated by SP
    u = update_service_providing_group.sync(
        client=client_sp,
        id=cast(int, spg.id),
        body=ServiceProvidingGroupUpdateRequest(
            status=ServiceProvidingGroupStatus.TERMINATED,
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    u = update_service_providing_group.sync(
        client=client_sp,
        id=cast(int, spg.id),
        body=ServiceProvidingGroupUpdateRequest(
            status=ServiceProvidingGroupStatus.ACTIVE,
        ),
    )
    assert isinstance(u, ErrorMessage)


# RLS: SPG-SO001
def test_spg_so(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    client_so = sts.get_client(TestEntity.TEST, "SO")
    so_id = sts.get_userinfo(client_so)["party_id"]

    client_sp = sts.get_client(TestEntity.TEST, "SP")
    sp_id = sts.get_userinfo(client_sp)["party_id"]
    spg = create_service_providing_group.sync(
        client=client_fiso,
        body=ServiceProvidingGroupCreateRequest(
            name="TEST-SPG-12",
            service_provider_id=sp_id,
        ),
    )
    assert isinstance(spg, ServiceProvidingGroupResponse)

    # SO does not see anything by default
    spgs = list_service_providing_group.sync(client=client_so)
    assert isinstance(spgs, list)

    # create an SPGGP
    spggp = create_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        body=ServiceProvidingGroupGridPrequalificationCreateRequest(
            service_providing_group_id=cast(int, spg.id),
            impacted_system_operator_id=so_id,
        ),
    )
    assert isinstance(spggp, ServiceProvidingGroupGridPrequalificationResponse)

    # SO can now see the SPG
    spgs2 = list_service_providing_group.sync(client=client_so)
    assert isinstance(spgs2, list)
    assert len(spgs2) == len(spgs) + 1

    spg = read_service_providing_group.sync(client=client_so, id=cast(int, spgs2[0].id))
    assert isinstance(spg, ServiceProvidingGroupResponse)


# RLS: SPG-COM001
def test_spg_common(sts):
    for role in sts.COMMON_ROLES:
        client = sts.get_client(TestEntity.TEST, role)

        # can read history on SPG they can read
        spg_visible = list_service_providing_group.sync(
            client=client,
        )
        assert isinstance(spg_visible, list)

        # only checking a few entries is sufficient
        for spg in spg_visible[:5]:
            # endpoint: GET /service_providing_group_history
            hist = list_service_providing_group_history.sync(
                client=client,
                service_providing_group_id=f"eq.{spg.id}",
            )
            assert isinstance(hist, list)
            assert len(hist) > 0

            # endpoint: GET /service_providing_group_history/{id}
            hist_spg = read_service_providing_group_history.sync(
                client=client, id=cast(int, hist[0].id)
            )
            assert isinstance(hist_spg, ServiceProvidingGroupHistoryResponse)


def test_rla_absence(sts):
    roles_without_rla = ["BRP", "EU", "ES", "MO", "TP"]

    for role in roles_without_rla:
        spgs = list_service_providing_group.sync(
            client=sts.get_client(TestEntity.TEST, role),
        )
        assert isinstance(spgs, list)
        assert len(spgs) == 0
