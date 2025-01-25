from security_token_service import SecurityTokenService, TestEntity
from flex import AuthenticatedClient
from flex.models import (
    ControllableUnitResponse,
    ControllableUnitCreateRequest,
    ControllableUnitRegulationDirection,
    ControllableUnitServiceProviderCreateRequest,
    ControllableUnitServiceProviderResponse,
    ServiceProvidingGroupResponse,
    ServiceProvidingGroupCreateRequest,
    ServiceProvidingGroupUpdateRequest,
    ServiceProvidingGroupStatus,
    ServiceProvidingGroupGridPrequalificationResponse,
    ServiceProvidingGroupGridPrequalificationCreateRequest,
    ServiceProvidingGroupGridPrequalificationUpdateRequest,
    ServiceProvidingGroupGridPrequalificationHistoryResponse,
    ServiceProvidingGroupGridPrequalificationStatus,
    ServiceProvidingGroupMembershipCreateRequest,
    ServiceProvidingGroupMembershipResponse,
    ErrorMessage,
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
from flex.api.service_providing_group_grid_prequalification import (
    create_service_providing_group_grid_prequalification,
    list_service_providing_group_grid_prequalification,
    update_service_providing_group_grid_prequalification,
    read_service_providing_group_grid_prequalification,
    list_service_providing_group_grid_prequalification_history,
    read_service_providing_group_grid_prequalification_history,
)
import pytest
from typing import cast


@pytest.fixture
def data():
    sts = SecurityTokenService()

    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    client_so = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST, "SO"))
    so_id = sts.get_userinfo(client_so)["party_id"]

    client_sp = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST, "SP"))
    sp_id = sts.get_userinfo(client_sp)["party_id"]

    # create a test SPG

    spg = create_service_providing_group.sync(
        client=client_fiso,
        body=ServiceProvidingGroupCreateRequest(
            service_provider_id=sp_id,
            name="New group",
        ),
    )
    assert isinstance(spg, ServiceProvidingGroupResponse)

    # create new controllable units with different connecting system operators

    cu1 = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="New CU 1",
            accounting_point_id="133700000000010014",
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_available_capacity=3.5,
        ),
    )
    assert isinstance(cu1, ControllableUnitResponse)

    cu2 = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="New CU 2",
            accounting_point_id="133700000000010014",
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_available_capacity=3.5,
        ),
    )
    assert isinstance(cu2, ControllableUnitResponse)

    # The SO is surfaced from the accounting point.
    # This test assumes that the accounting point is linked to the Test SO
    assert cu1.connecting_system_operator_id == so_id
    assert cu2.connecting_system_operator_id == so_id

    cu3 = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="New CU 3",
            accounting_point_id="133700000000000022",
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_available_capacity=3.5,
        ),
    )
    assert isinstance(cu3, ControllableUnitResponse)

    assert cu3.connecting_system_operator_id != so_id

    # relate the CUs to the SP in charge of the test SPG

    cu_sp1 = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cast(int, cu1.id),
            service_provider_id=sp_id,
            valid_from="2024-01-01T08:00:00+00:00",
        ),
    )
    assert isinstance(cu_sp1, ControllableUnitServiceProviderResponse)

    cu_sp2 = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cast(int, cu2.id),
            service_provider_id=sp_id,
            valid_from="2024-01-01T08:00:00+00:00",
        ),
    )
    assert isinstance(cu_sp2, ControllableUnitServiceProviderResponse)

    cu_sp3 = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cast(int, cu3.id),
            service_provider_id=sp_id,
            valid_from="2024-01-01T08:00:00+00:00",
        ),
    )
    assert isinstance(cu_sp3, ControllableUnitServiceProviderResponse)

    # put the CUs into the test SPG

    spgm1 = create_service_providing_group_membership.sync(
        client=client_fiso,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cast(int, cu1.id),
            service_providing_group_id=cast(int, spg.id),
            valid_from="2024-01-01T08:01:00+00:00",
        ),
    )
    assert isinstance(spgm1, ServiceProvidingGroupMembershipResponse)

    spgm2 = create_service_providing_group_membership.sync(
        client=client_fiso,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cast(int, cu2.id),
            service_providing_group_id=cast(int, spg.id),
            valid_from="2024-01-01T08:01:00+00:00",
        ),
    )
    assert isinstance(spgm2, ServiceProvidingGroupMembershipResponse)

    spgm3 = create_service_providing_group_membership.sync(
        client=client_fiso,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cast(int, cu3.id),
            service_providing_group_id=cast(int, spg.id),
            valid_from="2024-01-01T08:01:00+00:00",
        ),
    )
    assert isinstance(spgm3, ServiceProvidingGroupMembershipResponse)

    yield (sts, spg.id, so_id)


# ---- ---- ---- ---- ----


def test_spggp_fiso(data):
    (sts, spg_id, so_id) = data

    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # RLS: SPGGP-FISO001

    # endpoint: GET /service_providing_group_grid_prequalification
    spggps_spg = list_service_providing_group_grid_prequalification.sync(
        client=client_fiso, service_providing_group_id=f"eq.{spg_id}"
    )
    assert isinstance(spggps_spg, list)
    assert len(spggps_spg) == 0

    spggp = create_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        body=ServiceProvidingGroupGridPrequalificationCreateRequest(
            service_providing_group_id=spg_id,
            impacted_system_operator_id=so_id,
        ),
    )
    assert isinstance(spggp, ServiceProvidingGroupGridPrequalificationResponse)

    spggps_spg = list_service_providing_group_grid_prequalification.sync(
        client=client_fiso, service_providing_group_id=f"eq.{spg_id}"
    )
    assert isinstance(spggps_spg, list)
    assert len(spggps_spg) == 1

    # endpoint: GET /service_providing_group_grid_prequalification/{id}
    spggp = read_service_providing_group_grid_prequalification.sync(
        client=client_fiso, id=cast(int, spggps_spg[0].id)
    )
    assert isinstance(spggp, ServiceProvidingGroupGridPrequalificationResponse)

    # check status can be updated but not reset to requested
    # endpoint: PATCH /service_providing_group_grid_prequalification/{id}
    u = update_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        id=cast(int, spggp.id),
        body=ServiceProvidingGroupGridPrequalificationUpdateRequest(
            status=ServiceProvidingGroupGridPrequalificationStatus.IN_PROGRESS,
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    u = update_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        id=cast(int, spggp.id),
        body=ServiceProvidingGroupGridPrequalificationUpdateRequest(
            status=ServiceProvidingGroupGridPrequalificationStatus.REQUESTED,
        ),
    )
    assert isinstance(u, ErrorMessage)


def test_spggp_sp(data):
    (sts, spg_id, so_id) = data
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    client_sp = sts.get_client(TestEntity.TEST, "SP")

    # RLS: SPGGP-SP001
    # SP can read SPGGP on their SPG

    spggps_sp = list_service_providing_group_grid_prequalification.sync(
        client=client_sp,
    )
    assert isinstance(spggps_sp, list)

    spggp = create_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        body=ServiceProvidingGroupGridPrequalificationCreateRequest(
            service_providing_group_id=spg_id,
            impacted_system_operator_id=so_id,
        ),
    )
    assert isinstance(spggp, ServiceProvidingGroupGridPrequalificationResponse)

    spggps_sp2 = list_service_providing_group_grid_prequalification.sync(
        client=client_sp,
    )
    assert isinstance(spggps_sp2, list)
    assert len(spggps_sp2) == len(spggps_sp) + 1

    spggp = read_service_providing_group_grid_prequalification.sync(
        client=client_sp, id=cast(int, spggps_sp[0].id)
    )
    assert isinstance(spggp, ServiceProvidingGroupGridPrequalificationResponse)


def test_spggp_so(data):
    (sts, spg_id, so_id) = data
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    client_so = sts.get_client(TestEntity.TEST, "SO")

    spggps_so = list_service_providing_group_grid_prequalification.sync(
        client=client_so,
    )
    assert isinstance(spggps_so, list)

    # SPG activation triggers creation of SPGGP by the system
    u = update_service_providing_group.sync(
        client=client_fiso,
        id=spg_id,
        body=ServiceProvidingGroupUpdateRequest(
            status=ServiceProvidingGroupStatus.ACTIVE,
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    # RLS: SPGGP-SO001
    # SO can read SPGGP where they are impacted

    # but also

    # RLS: SPGGP-SO002
    # SO can see the SPGGP of other impacted SOs

    spggps_so2 = list_service_providing_group_grid_prequalification.sync(
        client=client_so,
    )
    assert isinstance(spggps_so2, list)
    assert len(spggps_so2) == len(spggps_so) + 2

    new_spggps = [
        spggp
        for spggp in spggps_so2
        if spggp.id not in set(spggp.id for spggp in spggps_so)
    ]

    (so_spggp, other_spggp) = (
        (new_spggps[0], new_spggps[1])
        if new_spggps[0].impacted_system_operator_id == so_id
        else (new_spggps[1], new_spggps[0])
    )

    spggp = read_service_providing_group_grid_prequalification.sync(
        client=client_so, id=cast(int, so_spggp.id)
    )
    assert isinstance(spggp, ServiceProvidingGroupGridPrequalificationResponse)

    spggp2 = read_service_providing_group_grid_prequalification.sync(
        client=client_so, id=cast(int, other_spggp.id)
    )
    assert isinstance(spggp2, ServiceProvidingGroupGridPrequalificationResponse)

    # RLS: SPGGP-SO001
    # SO can update SPGGP where they are impacted

    u = update_service_providing_group_grid_prequalification.sync(
        client=client_so,
        id=cast(int, so_spggp.id),
        body=ServiceProvidingGroupGridPrequalificationUpdateRequest(
            status=ServiceProvidingGroupGridPrequalificationStatus.IN_PROGRESS,
            notes="Edited by SO",
            last_prequalified="2024-01-01T08:00:00",
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    # but they cannot update the other ones
    u = update_service_providing_group_grid_prequalification.sync(
        client=client_so,
        id=cast(int, other_spggp.id),
        body=ServiceProvidingGroupGridPrequalificationUpdateRequest(
            status=ServiceProvidingGroupGridPrequalificationStatus.IN_PROGRESS,
            notes="Edited by SO",
            last_prequalified="2024-01-01T08:00:00",
        ),
    )
    assert isinstance(u, ErrorMessage)


# RLS: SPGGP-COM001
def test_spggp_common(data):
    (sts, _, _) = data

    for role in sts.COMMON_ROLES:
        client = sts.get_client(TestEntity.TEST, role)

        # can read history on SPGGP they can read
        spggp_visible = list_service_providing_group_grid_prequalification.sync(
            client=client,
        )
        assert isinstance(spggp_visible, list)

        # only checking a few entries is sufficient
        for spggp in spggp_visible[:5]:
            # endpoint: GET /service_providing_group_grid_prequalification_history
            hist = list_service_providing_group_grid_prequalification_history.sync(
                client=client,
                service_providing_group_grid_prequalification_id=f"eq.{spggp.id}",
            )
            assert isinstance(hist, list)
            assert len(hist) > 0

            # endpoint: GET /service_providing_group_grid_prequalification_history/{id}
            hist_spggp = (
                read_service_providing_group_grid_prequalification_history.sync(
                    client=client, id=cast(int, hist[0].id)
                )
            )
            assert isinstance(
                hist_spggp, ServiceProvidingGroupGridPrequalificationHistoryResponse
            )


def test_rla_absence(data):
    (sts, _, _) = data

    roles_without_rla = ["BRP", "EU", "ES", "MO", "TP"]

    for role in roles_without_rla:
        spggps = list_service_providing_group_grid_prequalification.sync(
            client=sts.get_client(TestEntity.TEST, role),
        )
        assert isinstance(spggps, list)
        assert len(spggps) == 0
