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
    ServiceProvidingGroupBiddingZone,
    ServiceProvidingGroupGridPrequalificationResponse,
    ServiceProvidingGroupGridPrequalificationCreateRequest,
    ServiceProvidingGroupGridPrequalificationUpdateRequest,
    ServiceProvidingGroupGridPrequalificationHistoryResponse,
    ServiceProvidingGroupGridPrequalificationStatus,
    ServiceProvidingGroupMembershipCreateRequest,
    ServiceProvidingGroupMembershipResponse,
    ServiceProvidingGroupProductApplicationCreateRequest,
    ServiceProvidingGroupProductApplicationUpdateRequest,
    ServiceProvidingGroupProductApplicationStatus,
    ServiceProvidingGroupProductApplicationResponse,
    SystemOperatorProductTypeCreateRequest,
    SystemOperatorProductTypeResponse,
    ServiceProviderProductApplicationCreateRequest,
    ServiceProviderProductApplicationUpdateRequest,
    ServiceProviderProductApplicationStatus,
    ServiceProviderProductApplicationResponse,
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
from flex.api.service_providing_group_product_application import (
    create_service_providing_group_product_application,
    update_service_providing_group_product_application,
)
from flex.api.system_operator_product_type import (
    create_system_operator_product_type,
)
from flex.api.service_provider_product_application import (
    create_service_provider_product_application,
    update_service_provider_product_application,
)
import datetime
import pytest
from typing import cast


@pytest.fixture
def data():
    sts = SecurityTokenService()

    client_fiso = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST, "FISO"))

    client_so = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST, "SO"))
    so_id = sts.get_userinfo(client_so)["party_id"]

    client_sp = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST, "SP"))
    sp_id = sts.get_userinfo(client_sp)["party_id"]

    client_other_so = cast(AuthenticatedClient, sts.get_client(TestEntity.COMMON, "SO"))
    other_so_id = sts.get_userinfo(client_other_so)["party_id"]

    # create a test SPG

    spg = create_service_providing_group.sync(
        client=client_fiso,
        body=ServiceProvidingGroupCreateRequest(
            service_provider_id=sp_id,
            name="New group",
            bidding_zone=ServiceProvidingGroupBiddingZone.NO3,
        ),
    )
    assert isinstance(spg, ServiceProvidingGroupResponse)

    # create new controllable units with different connecting system operators

    # NB:
    # APs above 1000 are linked to Test SO
    # APs below 1000 are linked to Common SO

    cu1 = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="New CU 1",
            accounting_point_id=1002,
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_active_power=3.5,
        ),
    )
    assert isinstance(cu1, ControllableUnitResponse)

    cu2 = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="New CU 2",
            accounting_point_id=1002,
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_active_power=3.5,
        ),
    )
    assert isinstance(cu2, ControllableUnitResponse)

    cu3 = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="New CU 3",
            accounting_point_id=3,
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_active_power=3.5,
        ),
    )
    assert isinstance(cu3, ControllableUnitResponse)

    # relate the CUs to the SP in charge of the test SPG

    client_eu = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST, "EU"))
    eu_id = sts.get_userinfo(client_eu)["party_id"]

    cu_sp1 = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cast(int, cu1.id),
            service_provider_id=sp_id,
            end_user_id=eu_id,
            contract_reference="TEST-CONTRACT",
            valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
        ),
    )
    assert isinstance(cu_sp1, ControllableUnitServiceProviderResponse)

    cu_sp2 = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cast(int, cu2.id),
            service_provider_id=sp_id,
            end_user_id=eu_id,
            contract_reference="TEST-CONTRACT",
            valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
        ),
    )
    assert isinstance(cu_sp2, ControllableUnitServiceProviderResponse)

    client_common_eu = cast(
        AuthenticatedClient, sts.get_client(TestEntity.COMMON, "EU")
    )
    common_eu_id = sts.get_userinfo(client_common_eu)["party_id"]

    cu_sp3 = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cast(int, cu3.id),
            service_provider_id=sp_id,
            end_user_id=common_eu_id,
            contract_reference="TEST-CONTRACT",
            valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
        ),
    )
    assert isinstance(cu_sp3, ControllableUnitServiceProviderResponse)

    # put the CUs into the test SPG
    # 1 in the past, 2 now/future

    spgm1 = create_service_providing_group_membership.sync(
        client=client_fiso,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cast(int, cu1.id),
            service_providing_group_id=cast(int, spg.id),
            valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
        ),
    )
    assert isinstance(spgm1, ServiceProvidingGroupMembershipResponse)

    spgm2 = create_service_providing_group_membership.sync(
        client=client_fiso,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cast(int, cu2.id),
            service_providing_group_id=cast(int, spg.id),
            valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
        ),
    )
    assert isinstance(spgm2, ServiceProvidingGroupMembershipResponse)

    spgm3 = create_service_providing_group_membership.sync(
        client=client_fiso,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cast(int, cu3.id),
            service_providing_group_id=cast(int, spg.id),
            valid_from=datetime.datetime.fromisoformat("2024-01-01T00:00:00+01:00"),
            valid_to=datetime.datetime.fromisoformat("2024-09-09T00:00:00+02:00"),
        ),
    )
    assert isinstance(spgm3, ServiceProvidingGroupMembershipResponse)

    # activate the SPG and qualify some product types for both SOs so that
    # SPGPAs can be created in the tests

    u = update_service_providing_group.sync(
        client=client_fiso,
        id=cast(int, spg.id),
        body=ServiceProvidingGroupUpdateRequest(
            status=ServiceProvidingGroupStatus.ACTIVE,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    pt_ids = [5, 7]

    for clt, id in [(client_so, so_id), (client_other_so, other_so_id)]:
        for pt_id in pt_ids:
            sopt = create_system_operator_product_type.sync(
                client=clt,
                body=SystemOperatorProductTypeCreateRequest(
                    system_operator_id=id,
                    product_type_id=pt_id,
                ),
            )
            # ignore duplicate error: SOPT may already exist from a previous run
            assert isinstance(sopt, (SystemOperatorProductTypeResponse, ErrorMessage))

        sppa = create_service_provider_product_application.sync(
            client=client_sp,
            body=ServiceProviderProductApplicationCreateRequest(
                service_provider_id=sp_id,
                system_operator_id=id,
                product_type_ids=pt_ids,
            ),
        )
        assert isinstance(sppa, ServiceProviderProductApplicationResponse)

        u = update_service_provider_product_application.sync(
            client=clt,
            id=cast(int, sppa.id),
            body=ServiceProviderProductApplicationUpdateRequest(
                status=ServiceProviderProductApplicationStatus.QUALIFIED,
                qualified_at=datetime.datetime.fromisoformat(
                    "2024-01-01T00:00:00+01:00"
                ),
            ),
        )
        assert not isinstance(u, ErrorMessage)

    yield (sts, spg.id, so_id, other_so_id, client_sp, sp_id, pt_ids)


# ---- ---- ---- ---- ----


def test_spggp_fiso(data):
    (sts, spg_id, _, so2_id, _, _, _) = data

    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # RLS: SPGGP-FISO001

    # endpoint: GET /service_providing_group_grid_prequalification
    spggps_spg = list_service_providing_group_grid_prequalification.sync(
        client=client_fiso, service_providing_group_id=f"eq.{spg_id}"
    )
    assert isinstance(spggps_spg, list)

    # the CU added in the past does not need to be prequalified
    # the 2 others have the same impacted SO
    assert len(spggps_spg) == 0

    # endpoint: POST /service_providing_group_grid_prequalification
    spggp = create_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        body=ServiceProvidingGroupGridPrequalificationCreateRequest(
            service_providing_group_id=spg_id,
            impacted_system_operator_id=so2_id,
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

    # RLS: SPGGP-VAL001
    # approved or conditionally approved but no timestamp: not ok
    u = update_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        id=cast(int, spggp.id),
        body=ServiceProvidingGroupGridPrequalificationUpdateRequest(
            status=ServiceProvidingGroupGridPrequalificationStatus.APPROVED,
        ),
    )
    assert isinstance(u, ErrorMessage)

    u = update_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        id=cast(int, spggp.id),
        body=ServiceProvidingGroupGridPrequalificationUpdateRequest(
            status=ServiceProvidingGroupGridPrequalificationStatus.CONDITIONALLY_APPROVED,
        ),
    )
    assert isinstance(u, ErrorMessage)

    u = update_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        id=cast(int, spggp.id),
        body=ServiceProvidingGroupGridPrequalificationUpdateRequest(
            status=ServiceProvidingGroupGridPrequalificationStatus.APPROVED,
            prequalified_at=datetime.datetime.fromisoformat("2024-01-01T08:00:00"),
        ),
    )
    assert not isinstance(u, ErrorMessage)

    u = update_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        id=cast(int, spggp.id),
        body=ServiceProvidingGroupGridPrequalificationUpdateRequest(
            status=ServiceProvidingGroupGridPrequalificationStatus.CONDITIONALLY_APPROVED,
            # timestamp was set right above
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # RLS: SPGGP-VAL002
    # not approved but timestamp: not ok
    u = update_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        id=cast(int, spggp.id),
        body=ServiceProvidingGroupGridPrequalificationUpdateRequest(
            status=ServiceProvidingGroupGridPrequalificationStatus.NOT_APPROVED,
        ),
    )
    assert isinstance(u, ErrorMessage)

    u = update_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        id=cast(int, spggp.id),
        body=ServiceProvidingGroupGridPrequalificationUpdateRequest(
            status=ServiceProvidingGroupGridPrequalificationStatus.NOT_APPROVED,
            prequalified_at=None,
        ),
    )
    assert not isinstance(u, ErrorMessage)


def test_spggp_sp(data):
    (sts, spg_id, _, so2_id, _, _, _) = data
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    client_sp = sts.get_client(TestEntity.TEST, "SP")

    # RLS: SPGGP-SP001
    # SP can read SPGGP on their SPG

    spggps_sp = list_service_providing_group_grid_prequalification.sync(
        client=client_sp,
        limit="10000",
    )
    assert isinstance(spggps_sp, list)

    spggp = create_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        body=ServiceProvidingGroupGridPrequalificationCreateRequest(
            service_providing_group_id=spg_id,
            impacted_system_operator_id=so2_id,
        ),
    )
    assert isinstance(spggp, ServiceProvidingGroupGridPrequalificationResponse)

    spggps_sp2 = list_service_providing_group_grid_prequalification.sync(
        client=client_sp,
        limit="10000",
    )
    assert isinstance(spggps_sp2, list)
    assert len(spggps_sp2) == len(spggps_sp) + 1

    spggp = read_service_providing_group_grid_prequalification.sync(
        client=client_sp, id=cast(int, spggps_sp[0].id)
    )
    assert isinstance(spggp, ServiceProvidingGroupGridPrequalificationResponse)


def test_spggp_so(data):
    (sts, spg_id, so_id, other_so_id, client_sp, sp_id, pt_ids) = data
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    client_so = sts.get_client(TestEntity.TEST, "SO")

    spggps_so = list_service_providing_group_grid_prequalification.sync(
        client=client_so,
        limit="10000",
    )
    assert isinstance(spggps_so, list)

    # open an SPGPA and make it ready for grid prequalification, so a SPGGP is
    # created by the system for Test SO

    spgpa = create_service_providing_group_product_application.sync(
        client=client_sp,
        body=ServiceProvidingGroupProductApplicationCreateRequest(
            service_providing_group_id=spg_id,
            procuring_system_operator_id=so_id,
            product_type_ids=[pt_ids[0]],
            maximum_active_power_up=3.5,
            maximum_active_power_down=3.5,
        ),
    )
    assert isinstance(spgpa, ServiceProvidingGroupProductApplicationResponse)

    u = update_service_providing_group_product_application.sync(
        client=client_fiso,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            status=ServiceProvidingGroupProductApplicationStatus.READY_FOR_GRID_PREQUALIFICATION,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # create a second SPGGP manually for another SO, so we can test SO002
    other_spggp = create_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        body=ServiceProvidingGroupGridPrequalificationCreateRequest(
            service_providing_group_id=spg_id,
            impacted_system_operator_id=other_so_id,
        ),
    )
    assert isinstance(other_spggp, ServiceProvidingGroupGridPrequalificationResponse)

    # RLS: SPGGP-SO001
    # SO can read SPGGP where they are impacted

    # but also

    # RLS: SPGGP-SO002
    # SO can see the SPGGP of other impacted SOs on the same SPG

    spggps_so2 = list_service_providing_group_grid_prequalification.sync(
        client=client_so,
        limit="10000",
    )
    assert isinstance(spggps_so2, list)
    assert len(spggps_so2) == len(spggps_so) + 2

    new_spggps = [
        spggp
        for spggp in spggps_so2
        if spggp.id not in set(spggp.id for spggp in spggps_so)
    ]
    assert len(new_spggps) == 2

    so_spggp = next(s for s in new_spggps if s.impacted_system_operator_id == so_id)
    other_spggp_visible = next(
        s for s in new_spggps if s.impacted_system_operator_id == other_so_id
    )

    spggp = read_service_providing_group_grid_prequalification.sync(
        client=client_so, id=cast(int, so_spggp.id)
    )
    assert isinstance(spggp, ServiceProvidingGroupGridPrequalificationResponse)

    spggp2 = read_service_providing_group_grid_prequalification.sync(
        client=client_so, id=cast(int, other_spggp_visible.id)
    )
    assert isinstance(spggp2, ServiceProvidingGroupGridPrequalificationResponse)

    # RLS: SPGGP-SO001
    # SO can update SPGGP where they are impacted

    spggps_so = list_service_providing_group_grid_prequalification.sync(
        client=client_so,
        impacted_system_operator_id=f"eq.{so_id}",
    )
    assert isinstance(spggps_so, list)
    assert len(spggps_so) > 0, (
        "No SPGGP records returned for impacted_system_operator_id"
    )
    so_spggp = spggps_so[0]

    u = update_service_providing_group_grid_prequalification.sync(
        client=client_so,
        id=cast(int, so_spggp.id),
        body=ServiceProvidingGroupGridPrequalificationUpdateRequest(
            status=ServiceProvidingGroupGridPrequalificationStatus.IN_PROGRESS,
            prequalified_at=datetime.datetime.fromisoformat("2024-01-01T08:00:00"),
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    # but they cannot update the other ones
    u = update_service_providing_group_grid_prequalification.sync(
        client=client_so,
        id=cast(int, other_spggp.id),
        body=ServiceProvidingGroupGridPrequalificationUpdateRequest(
            status=ServiceProvidingGroupGridPrequalificationStatus.IN_PROGRESS,
            prequalified_at=datetime.datetime.fromisoformat("2024-01-01T08:00:00"),
        ),
    )
    assert isinstance(u, ErrorMessage)


# RLS: SPGGP-COM001
def test_spggp_common(data):
    (sts, _, _, _, _, _, _) = data

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
    (sts, _, _, _, _, _, _) = data

    roles_without_rla = ["BRP", "EU", "ES", "MO", "TP"]

    for role in roles_without_rla:
        spggps = list_service_providing_group_grid_prequalification.sync(
            client=sts.get_client(TestEntity.TEST, role),
        )
        assert isinstance(spggps, list)
        assert len(spggps) == 0
