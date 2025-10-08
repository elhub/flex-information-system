from security_token_service import (
    SecurityTokenService,
    AuthenticatedClient,
    TestEntity,
)
from flex.models import (
    ServiceProvidingGroupGridSuspensionHistoryResponse,
    ServiceProvidingGroupGridSuspensionResponse,
    ServiceProvidingGroupGridSuspensionUpdateRequest,
    ServiceProvidingGroupGridSuspensionCreateRequest,
    ServiceProvidingGroupGridSuspensionReason,
    ServiceProvidingGroupProductApplicationCreateRequest,
    ServiceProvidingGroupProductApplicationResponse,
    ServiceProvidingGroupProductApplicationUpdateRequest,
    ServiceProvidingGroupProductApplicationStatus,
    ServiceProvidingGroupCreateRequest,
    ServiceProvidingGroupUpdateRequest,
    ServiceProvidingGroupResponse,
    ServiceProvidingGroupStatus,
    ServiceProvidingGroupMembershipCreateRequest,
    ServiceProvidingGroupMembershipResponse,
    ServiceProvidingGroupGridPrequalificationCreateRequest,
    ServiceProvidingGroupGridPrequalificationUpdateRequest,
    ServiceProvidingGroupGridPrequalificationResponse,
    ServiceProvidingGroupGridPrequalificationStatus,
    ServiceProviderProductApplicationCreateRequest,
    ServiceProviderProductApplicationResponse,
    ServiceProviderProductApplicationUpdateRequest,
    ServiceProviderProductApplicationStatus,
    ControllableUnitCreateRequest,
    ControllableUnitRegulationDirection,
    ControllableUnitResponse,
    ControllableUnitServiceProviderCreateRequest,
    ControllableUnitServiceProviderResponse,
    SystemOperatorProductTypeCreateRequest,
    SystemOperatorProductTypeResponse,
    ErrorMessage,
    EmptyObject,
)
from flex.api.system_operator_product_type import (
    create_system_operator_product_type,
)
from flex.api.service_providing_group import (
    create_service_providing_group,
    update_service_providing_group,
)
from flex.api.service_providing_group_membership import (
    create_service_providing_group_membership,
)
from flex.api.controllable_unit import (
    create_controllable_unit,
)
from flex.api.controllable_unit_service_provider import (
    create_controllable_unit_service_provider,
)
from flex.api.service_providing_group_grid_prequalification import (
    create_service_providing_group_grid_prequalification,
    list_service_providing_group_grid_prequalification,
    update_service_providing_group_grid_prequalification,
)
from flex.api.service_provider_product_application import (
    create_service_provider_product_application,
    update_service_provider_product_application,
)
from flex.api.service_providing_group_product_application import (
    create_service_providing_group_product_application,
    update_service_providing_group_product_application,
)
from flex.api.service_providing_group_grid_suspension import (
    list_service_providing_group_grid_suspension,
    read_service_providing_group_grid_suspension,
    update_service_providing_group_grid_suspension,
    create_service_providing_group_grid_suspension,
    delete_service_providing_group_grid_suspension,
    list_service_providing_group_grid_suspension_history,
    read_service_providing_group_grid_suspension_history,
)
import pytest
from typing import cast


@pytest.fixture()
def data():
    sts = SecurityTokenService()

    client_fiso = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST, "FISO"))

    client_so = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST, "SO"))
    so_id = sts.get_userinfo(client_so)["party_id"]

    client_sp = sts.fresh_client(TestEntity.TEST, "SP")
    sp_id = sts.get_userinfo(client_sp)["party_id"]

    client_eu = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST, "EU"))
    eu_id = sts.get_userinfo(client_eu)["party_id"]

    # chain of dependency to be able to create SPG grid suspensions:
    #   SPG -> CU -> CUSP -> SPGM -> active SPG -> SPGGP / SPGPA -> suspension

    spg = create_service_providing_group.sync(
        client=client_fiso,
        body=ServiceProvidingGroupCreateRequest(
            name="TEST-SPG-SUSP-1",
            service_provider_id=sp_id,
        ),
    )
    assert isinstance(spg, ServiceProvidingGroupResponse)

    cu = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="CU-SUSP-1",
            accounting_point_id=1002,  # managed by Test SO
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
            end_user_id=eu_id,
            contract_reference="TEST-CONTRACT-SUSP-1",
            valid_from="2024-01-01T00:00:00+1",
        ),
    )
    assert isinstance(cu_sp, ControllableUnitServiceProviderResponse)

    spgm = create_service_providing_group_membership.sync(
        client=client_fiso,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_providing_group_id=cast(int, spg.id),
            valid_from="2024-01-01T00:00:00+1",
        ),
    )
    assert isinstance(spgm, ServiceProvidingGroupMembershipResponse)

    # activate the SPG and get the SPGGP created automatically

    u = update_service_providing_group.sync(
        client=client_sp,
        id=cast(int, spg.id),
        body=ServiceProvidingGroupUpdateRequest(
            name="TEST-SPG-SUSP-1 ACTIVATED",
            status=ServiceProvidingGroupStatus.ACTIVE,
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    spggps = list_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        service_providing_group_id=f"eq.{spg.id}",
    )
    assert isinstance(spggps, list)
    assert len(spggps) == 1

    u = update_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        id=cast(int, spggps[0].id),
        body=ServiceProvidingGroupGridPrequalificationUpdateRequest(
            status=ServiceProvidingGroupGridPrequalificationStatus.IN_PROGRESS,
            prequalified_at="2025-01-01T00:00:00+1",
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    yield (sts, spg.id, so_id, client_sp, sp_id)


# ---- ---- ---- ---- ----


def check_history(client, spggs_id):
    # endpoint: GET /service_providing_group_grid_suspension_history
    hist = list_service_providing_group_grid_suspension_history.sync(
        client=client,
        service_providing_group_grid_suspension_id=f"eq.{spggs_id}",
    )
    assert isinstance(hist, list)
    assert len(hist) > 0

    # endpoint: GET /service_providing_group_grid_suspension_history/{id}
    hist_spggs = read_service_providing_group_grid_suspension_history.sync(
        client=client,
        id=cast(int, hist[0].id),
    )
    assert isinstance(
        hist_spggs,
        ServiceProvidingGroupGridSuspensionHistoryResponse,
    )


# RLS: SPGGS-FISO001
def test_spggs_fiso(data):
    (sts, spg_id, so_id, _, _) = data

    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # endpoint: POST /service_providing_group_grid_suspension
    spggs = create_service_providing_group_grid_suspension.sync(
        client=client_fiso,
        body=ServiceProvidingGroupGridSuspensionCreateRequest(
            impacted_system_operator_id=so_id,
            service_providing_group_id=spg_id,
            reason=ServiceProvidingGroupGridSuspensionReason.BREACH_OF_CONDITIONS,
        ),
    )
    assert isinstance(spggs, ServiceProvidingGroupGridSuspensionResponse)

    # endpoint: GET /service_providing_group_grid_suspension
    spggss = list_service_providing_group_grid_suspension.sync(client=client_fiso)
    assert isinstance(spggss, list)
    assert len(spggss) > 0

    # endpoint: GET /service_providing_group_grid_suspension/{id}
    s = read_service_providing_group_grid_suspension.sync(
        client=client_fiso,
        id=cast(int, spggss[0].id),
    )
    assert isinstance(s, ServiceProvidingGroupGridSuspensionResponse)

    # RLS: SPGGS-FISO002
    check_history(client_fiso, s.id)

    # endpoint: PATCH /service_providing_group_grid_suspension/{id}
    u = update_service_providing_group_grid_suspension.sync(
        client=client_fiso,
        id=cast(int, s.id),
        body=ServiceProvidingGroupGridSuspensionUpdateRequest(
            reason=ServiceProvidingGroupGridSuspensionReason.OTHER,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # endpoint: DELETE /service_providing_group_grid_suspension/{id}
    d = delete_service_providing_group_grid_suspension.sync(
        client=client_fiso, id=cast(int, s.id), body=EmptyObject()
    )
    assert not isinstance(d, ErrorMessage)


# RLS: SPGGS-SP001
def test_spggs_sp(data):
    (sts, spg_id, so_id, client_sp, _) = data

    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    spggs = create_service_providing_group_grid_suspension.sync(
        client=client_fiso,
        body=ServiceProvidingGroupGridSuspensionCreateRequest(
            impacted_system_operator_id=so_id,
            service_providing_group_id=spg_id,
            reason=ServiceProvidingGroupGridSuspensionReason.OTHER,
        ),
    )
    assert isinstance(spggs, ServiceProvidingGroupGridSuspensionResponse)

    # SP can read

    spggs = read_service_providing_group_grid_suspension.sync(
        client=client_sp,
        id=cast(int, spggs.id),
    )
    assert isinstance(spggs, ServiceProvidingGroupGridSuspensionResponse)

    check_history(client_sp, spggs.id)

    d = delete_service_providing_group_grid_suspension.sync(
        client=client_fiso, id=cast(int, spggs.id), body=EmptyObject()
    )
    assert not isinstance(d, ErrorMessage)

    # RLS: SPGGS-SP002
    # they can still read history after deletion
    check_history(client_sp, spggs.id)


def test_spggs_so(data):
    (sts, spg_id, _, client_sp, sp_id) = data

    # RLS: SPGGS-SO001
    # SO can do everything on their own SPGGS

    client_so = sts.get_client(TestEntity.TEST, "SO")

    s = create_service_providing_group_grid_suspension.sync(
        client=client_so,
        body=ServiceProvidingGroupGridSuspensionCreateRequest(
            service_providing_group_id=spg_id,
            reason=ServiceProvidingGroupGridSuspensionReason.OTHER,
        ),
    )
    assert isinstance(s, ServiceProvidingGroupGridSuspensionResponse)

    spggss = list_service_providing_group_grid_suspension.sync(client=client_so)
    assert isinstance(spggss, list)
    assert len(spggss) > 0

    spggs = read_service_providing_group_grid_suspension.sync(
        client=client_so,
        id=cast(int, spggss[0].id),
    )
    assert isinstance(spggs, ServiceProvidingGroupGridSuspensionResponse)

    # RLS: SPGGS-SO002
    check_history(client_so, s.id)

    u = update_service_providing_group_grid_suspension.sync(
        client=client_so,
        id=cast(int, s.id),
        body=ServiceProvidingGroupGridSuspensionUpdateRequest(
            reason=ServiceProvidingGroupGridSuspensionReason.BREACH_OF_CONDITIONS,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # RLS: SPGGS-SO005

    # create ISO through grid prequalification

    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    client_other_iso = sts.fresh_client(TestEntity.TEST, "SO")
    other_iso_id = sts.get_userinfo(client_other_iso)["party_id"]

    spggp = create_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        body=ServiceProvidingGroupGridPrequalificationCreateRequest(
            service_providing_group_id=spg_id,
            impacted_system_operator_id=other_iso_id,
        ),
    )
    assert isinstance(spggp, ServiceProvidingGroupGridPrequalificationResponse)

    u = update_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        id=cast(int, spggp.id),
        body=ServiceProvidingGroupGridPrequalificationUpdateRequest(
            status=ServiceProvidingGroupGridPrequalificationStatus.CONDITIONALLY_APPROVED,
            prequalified_at="2025-01-01T00:00:00+1",
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    # they should be able to read SPGGS
    spggs = read_service_providing_group_grid_suspension.sync(
        client=client_other_iso,
        id=cast(int, s.id),
    )
    assert isinstance(spggs, ServiceProvidingGroupGridSuspensionResponse)

    # RLS: SPGGS-SO006
    check_history(client_other_iso, spggs.id)

    u = update_service_providing_group_grid_suspension.sync(
        client=client_so,
        id=cast(int, s.id),
        body=ServiceProvidingGroupGridSuspensionUpdateRequest(
            reason=ServiceProvidingGroupGridSuspensionReason.OTHER,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    u = update_service_providing_group_grid_prequalification.sync(
        client=client_fiso,
        id=cast(int, spggp.id),
        body=ServiceProvidingGroupGridPrequalificationUpdateRequest(
            status=ServiceProvidingGroupGridPrequalificationStatus.NOT_APPROVED,
            prequalified_at=None,
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    check_history(client_other_iso, s.id)

    # RLS: SPGGS-SO003
    # create a PSO and make a qualified product application
    # SOPT -> SPPA -> SPGPA

    client_pso = sts.fresh_client(TestEntity.TEST, "SO")
    pso_id = sts.get_userinfo(client_pso)["party_id"]

    sopt = create_system_operator_product_type.sync(
        client=client_pso,
        body=SystemOperatorProductTypeCreateRequest(
            system_operator_id=pso_id,
            product_type_id=4,
        ),
    )
    assert isinstance(sopt, SystemOperatorProductTypeResponse)

    sppa = create_service_provider_product_application.sync(
        client=client_sp,
        body=ServiceProviderProductApplicationCreateRequest(
            service_provider_id=sp_id,
            system_operator_id=pso_id,
            product_type_ids=[4],
        ),
    )
    assert isinstance(sppa, ServiceProviderProductApplicationResponse)

    u = update_service_provider_product_application.sync(
        client=client_pso,
        id=cast(int, sppa.id),
        body=ServiceProviderProductApplicationUpdateRequest(
            status=ServiceProviderProductApplicationStatus.QUALIFIED,
            qualified_at="2024-01-01T00:00:00+1",
        ),
    )
    assert not isinstance(u, ErrorMessage)

    spgpa = create_service_providing_group_product_application.sync(
        client=client_sp,
        body=ServiceProvidingGroupProductApplicationCreateRequest(
            service_providing_group_id=spg_id,
            procuring_system_operator_id=pso_id,
            product_type_ids=[4],
        ),
    )
    assert isinstance(spgpa, ServiceProvidingGroupProductApplicationResponse)

    u = update_service_providing_group_product_application.sync(
        client=client_pso,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            status=ServiceProvidingGroupProductApplicationStatus.PREQUALIFIED,
            prequalified_at="2024-01-01T00:00:00+1",
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # they should be able to read SPGGS
    spggs = read_service_providing_group_grid_suspension.sync(
        client=client_pso,
        id=cast(int, s.id),
    )
    assert isinstance(spggs, ServiceProvidingGroupGridSuspensionResponse)

    # RLS: SPGGS-SO004
    check_history(client_pso, s.id)

    u = update_service_providing_group_grid_suspension.sync(
        client=client_so,
        id=cast(int, s.id),
        body=ServiceProvidingGroupGridSuspensionUpdateRequest(
            reason=ServiceProvidingGroupGridSuspensionReason.SIGNIFICANT_GROUP_CHANGE,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    u = update_service_providing_group_product_application.sync(
        client=client_pso,
        id=cast(int, spgpa.id),
        body=ServiceProvidingGroupProductApplicationUpdateRequest(
            status=ServiceProvidingGroupProductApplicationStatus.REJECTED,
            prequalified_at=None,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    check_history(client_pso, s.id)

    # now delete suspension and check everyone can still see the history

    d = delete_service_providing_group_grid_suspension.sync(
        client=client_so, id=cast(int, s.id), body=EmptyObject()
    )
    assert not isinstance(d, ErrorMessage)

    check_history(client_so, s.id)
    check_history(client_other_iso, s.id)
    check_history(client_pso, s.id)
