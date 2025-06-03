from security_token_service import (
    SecurityTokenService,
    TestEntity,
    AuthenticatedClient,
)
from flex.models import (
    ControllableUnitResponse,
    ControllableUnitCreateRequest,
    ControllableUnitServiceProviderResponse,
    ControllableUnitServiceProviderCreateRequest,
    ControllableUnitRegulationDirection,
    ServiceProvidingGroupResponse,
    ServiceProvidingGroupCreateRequest,
    ServiceProvidingGroupMembershipResponse,
    ServiceProvidingGroupMembershipCreateRequest,
    ServiceProvidingGroupMembershipUpdateRequest,
    ServiceProvidingGroupMembershipHistoryResponse,
    ServiceProvidingGroupGridPrequalificationCreateRequest,
    ServiceProvidingGroupGridPrequalificationResponse,
    ErrorMessage,
    EmptyObject,
)
from flex.api.controllable_unit import (
    create_controllable_unit,
)
from flex.api.controllable_unit_service_provider import (
    create_controllable_unit_service_provider,
)
from flex.api.service_providing_group import (
    create_service_providing_group,
)
from flex.api.service_providing_group_membership import (
    create_service_providing_group_membership,
    delete_service_providing_group_membership,
    list_service_providing_group_membership,
    update_service_providing_group_membership,
    read_service_providing_group_membership,
    list_service_providing_group_membership_history,
    read_service_providing_group_membership_history,
)
from flex.api.service_providing_group_grid_prequalification import (
    create_service_providing_group_grid_prequalification,
)
import pytest
from typing import cast


@pytest.fixture
def data():
    sts = SecurityTokenService()

    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    client_sp = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST, "SP"))
    sp_id = sts.get_userinfo(client_sp)["party_id"]

    # Create new controllable unit and spg to play with
    cu = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="New CU",
            accounting_point_id=1002,
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_available_capacity=3.5,
        ),
    )
    assert isinstance(cu, ControllableUnitResponse)

    # NB: the AP there is linked to Test SO in the test data

    spg = create_service_providing_group.sync(
        client=client_fiso,
        body=ServiceProvidingGroupCreateRequest(
            service_provider_id=sp_id,
            name="New group",
        ),
    )
    assert isinstance(spg, ServiceProvidingGroupResponse)

    yield (sts, cu.id, spg.id)


# ---- ---- ---- ---- ----


def test_cusp_spgm_consistency_not_ok(data):
    (sts, cu_id, spg_id) = data

    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    sp_id = sts.get_userinfo(sts.get_client(TestEntity.TEST, "SP"))["party_id"]

    # Create a contract
    #   between the CU and the SP
    #   from 08.01.2024 to 12.01.2024
    cu_sp = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cu_id,
            service_provider_id=sp_id,
            end_user_id=11,
            contract_reference="TEST-CONTRACT",
            valid_from="2024-01-08T00:00:00+1",
            valid_to="2024-01-12T00:00:00+1",
        ),
    )
    assert isinstance(cu_sp, ControllableUnitServiceProviderResponse)

    # Put the CU into the SPG from 07.01.2024 to 11.01.2024
    spgm = create_service_providing_group_membership.sync(
        client=client_fiso,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cu_id,
            service_providing_group_id=spg_id,
            valid_from="2024-01-07T00:00:00+1",
            valid_to="2024-01-11T00:00:00+1",
        ),
    )
    # should fail (begins before the CU is linked to the SP)
    assert isinstance(spgm, ErrorMessage)

    # Put the CU into the SPG from 09.01.2024 to 13.01.2024
    spgm = create_service_providing_group_membership.sync(
        client=client_fiso,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cu_id,
            service_providing_group_id=spg_id,
            valid_from="2024-01-09T00:00:00+1",
            valid_to="2024-01-13T00:00:00+1",
        ),
    )
    # should fail (finishes after the CU is linked to the SP)
    assert isinstance(spgm, ErrorMessage)


# RLS: SPGM-SP002
def test_spgm_sp002(data):
    (sts, cu_id, spg_id) = data

    client_sp = sts.get_client(TestEntity.TEST, "SP")

    # try before the CU-SP link
    spgm = create_service_providing_group_membership.sync(
        client=client_sp,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cu_id,
            service_providing_group_id=spg_id,
            valid_from="2024-01-01T08:01:00+00:00",
            valid_to="2024-01-01T09:59:00+00:00",
        ),
    )
    # should fail
    assert isinstance(spgm, ErrorMessage)

    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    sp_id = sts.get_userinfo(client_sp)["party_id"]

    # Create a contract
    #   between the CU and the SP
    #   from 08.01.2024 to 12.01.2024
    cu_sp = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cu_id,
            service_provider_id=sp_id,
            end_user_id=11,
            contract_reference="TEST-CONTRACT",
            valid_from="2024-01-08T00:00:00+1",
            valid_to="2024-01-12T00:00:00+1",
        ),
    )
    assert isinstance(cu_sp, ControllableUnitServiceProviderResponse)

    # Put the CU into the SPG from 09.01.2024 to 11.01.2024
    # (fully in the validity of the CU-SP contract)
    # after the CU-SP link
    # endpoint: POST /service_providing_group_membership
    spgm = create_service_providing_group_membership.sync(
        client=client_sp,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cu_id,
            service_providing_group_id=spg_id,
            valid_from="2024-01-09T00:00:00+1",
            valid_to="2024-01-11T00:00:00+1",
        ),
    )
    assert isinstance(spgm, ServiceProvidingGroupMembershipResponse)

    # try to update as another SP
    client_sp2 = sts.get_client(TestEntity.COMMON, "SP")
    u = update_service_providing_group_membership.sync(
        client=client_sp2,
        id=cast(int, spgm.id),
        body=ServiceProvidingGroupMembershipUpdateRequest(
            valid_to="2024-01-10T00:00:00+1",
        ),
    )
    assert isinstance(u, ErrorMessage)

    # endpoint: PATCH /service_providing_group_membership/{id}
    u = update_service_providing_group_membership.sync(
        client=client_sp,
        id=cast(int, spgm.id),
        body=ServiceProvidingGroupMembershipUpdateRequest(
            valid_to="2024-01-10T00:00:00+1",
        ),
    )
    assert not (isinstance(u, ErrorMessage))


def test_spgm(data):
    (sts, cu_id, spg_id) = data

    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    client_sp = sts.get_client(TestEntity.TEST, "SP")
    sp_id = sts.get_userinfo(client_sp)["party_id"]

    # Create a contract
    #   between the CU and the SP
    #   from 08.01.2024 to 12.01.2024
    cu_sp = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cu_id,
            service_provider_id=sp_id,
            end_user_id=11,
            contract_reference="TEST-CONTRACT",
            valid_from="2024-01-08T00:00:00+1",
            valid_to="2024-01-12T00:00:00+1",
        ),
    )
    assert isinstance(cu_sp, ControllableUnitServiceProviderResponse)

    # RLS: SPGM-FISO001
    # RLS: SPGM-SP001

    # endpoint: GET /service_providing_group_membership
    spgms_cu = list_service_providing_group_membership.sync(
        client=client_fiso, controllable_unit_id=f"eq.{cu_id}"
    )
    assert isinstance(spgms_cu, list)
    assert len(spgms_cu) == 0

    spgm = create_service_providing_group_membership.sync(
        client=client_fiso,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cu_id,
            service_providing_group_id=spg_id,
            valid_from="2024-01-09T00:00:00+1",
            valid_to="2024-01-11T00:00:00+1",
        ),
    )
    assert isinstance(spgm, ServiceProvidingGroupMembershipResponse)

    spgms_cu = list_service_providing_group_membership.sync(
        client=client_sp, controllable_unit_id=f"eq.{cu_id}"
    )
    assert isinstance(spgms_cu, list)
    assert len(spgms_cu) == 1

    spgms_spg = list_service_providing_group_membership.sync(
        client=client_sp, service_providing_group_id=f"eq.{spg_id}"
    )
    assert isinstance(spgms_spg, list)
    assert len(spgms_spg) >= 1

    # endpoint: GET /service_providing_group_membership/{id}
    spgm = read_service_providing_group_membership.sync(
        client=client_sp, id=cast(int, spgms_cu[0].id)
    )
    assert isinstance(spgm, ServiceProvidingGroupMembershipResponse)
    spgm = read_service_providing_group_membership.sync(
        client=client_fiso, id=cast(int, spgms_cu[0].id)
    )
    assert isinstance(spgm, ServiceProvidingGroupMembershipResponse)

    u = update_service_providing_group_membership.sync(
        client=client_fiso,
        id=cast(int, spgm.id),
        body=ServiceProvidingGroupMembershipUpdateRequest(
            valid_to="2024-01-10T00:00:00+1",
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    # endpoint: DELETE /service_providing_group_membership/{id}
    d = delete_service_providing_group_membership.sync(
        client=client_fiso,
        id=cast(int, spgm.id),
        body=EmptyObject(),
    )
    assert not (isinstance(d, ErrorMessage))

    # redo as SP

    spgm = create_service_providing_group_membership.sync(
        client=client_sp,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cu_id,
            service_providing_group_id=spg_id,
            valid_from="2024-01-09T00:00:00+1",
            valid_to="2024-01-11T00:00:00+1",
        ),
    )
    assert isinstance(spgm, ServiceProvidingGroupMembershipResponse)

    d = delete_service_providing_group_membership.sync(
        client=client_sp,
        id=cast(int, spgm.id),
        body=EmptyObject(),
    )
    assert not (isinstance(d, ErrorMessage))


def test_spgm_so(data):
    (sts, cu_id, spg_id) = data
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # add a contract between CU and SP, add CU to the SPG
    client_sp = sts.get_client(TestEntity.TEST, "SP")
    sp_id = sts.get_userinfo(client_sp)["party_id"]
    cu_sp = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cu_id,
            service_provider_id=sp_id,
            end_user_id=11,
            contract_reference="TEST-CONTRACT",
            valid_from="2024-01-09T00:00:00+1",
        ),
    )
    assert isinstance(cu_sp, ControllableUnitServiceProviderResponse)

    spgm = create_service_providing_group_membership.sync(
        client=client_sp,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cu_id,
            service_providing_group_id=spg_id,
            valid_from="2024-01-10T00:00:00+1",
            valid_to="2024-01-11 Europe/Oslo",
        ),
    )
    assert isinstance(spgm, ServiceProvidingGroupMembershipResponse)

    client_so = sts.get_client(TestEntity.TEST, "SO")
    so_id = sts.get_userinfo(client_so)["party_id"]

    # RLS: SPGM-SO001

    # by default SO sees nothing
    spgms_spg = list_service_providing_group_membership.sync(
        client=client_so, service_providing_group_id=f"eq.{spg_id}"
    )
    assert isinstance(spgms_spg, list)

    # create an SPGGP
    spggp = create_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        body=ServiceProvidingGroupGridPrequalificationCreateRequest(
            service_providing_group_id=cast(int, spg_id),
            impacted_system_operator_id=so_id,
        ),
    )
    assert isinstance(spggp, ServiceProvidingGroupGridPrequalificationResponse)

    # SO can now see the new SPGM
    spgms_spg2 = list_service_providing_group_membership.sync(
        client=client_so, service_providing_group_id=f"eq.{spg_id}"
    )
    assert isinstance(spgms_spg2, list)
    assert len(spgms_spg2) == len(spgms_spg) + 1

    spg = read_service_providing_group_membership.sync(
        client=client_so, id=cast(int, spgms_spg2[0].id)
    )
    assert isinstance(spg, ServiceProvidingGroupMembershipResponse)


# RLS: SPGM-COM001
def test_spgm_common(data):
    (sts, _, _) = data

    for role in sts.COMMON_ROLES:
        client = sts.get_client(TestEntity.TEST, role)

        # can read history on SPGM they can read
        spgm_visible = list_service_providing_group_membership.sync(
            client=client,
        )
        assert isinstance(spgm_visible, list)

        # only checking a few entries is sufficient
        for spg in spgm_visible[:5]:
            # endpoint: GET /service_providing_group_membership_history
            hist = list_service_providing_group_membership_history.sync(
                client=client,
                service_providing_group_membership_id=f"eq.{spg.id}",
            )
            assert isinstance(hist, list)
            assert len(hist) > 0

            # endpoint: GET /service_providing_group_membership_history/{id}
            hist_spg = read_service_providing_group_membership_history.sync(
                client=client, id=cast(int, hist[0].id)
            )
            assert isinstance(hist_spg, ServiceProvidingGroupMembershipHistoryResponse)


def test_rla_absence(data):
    (sts, _, _) = data

    roles_without_rla = ["BRP", "EU", "ES", "MO", "TP"]

    for role in roles_without_rla:
        spgms = list_service_providing_group_membership.sync(
            client=sts.get_client(TestEntity.TEST, role),
        )
        assert isinstance(spgms, list)
        assert len(spgms) == 0
