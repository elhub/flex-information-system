from security_token_service import (
    SecurityTokenService,
    AuthenticatedClient,
    TestEntity,
)
from flex.models import (
    ControllableUnitCreateRequest,
    ControllableUnitRegulationDirection,
    ControllableUnitResponse,
    ControllableUnitServiceProviderCreateRequest,
    ControllableUnitServiceProviderResponse,
    ServiceProvidingGroupResponse,
    ErrorMessage,
    EmptyObject,
)
from flex.models import (
    ControllableUnitSuspensionCreateRequest,
    ControllableUnitSuspensionResponse,
    ControllableUnitSuspensionReason,
    ControllableUnitSuspensionUpdateRequest,
    ControllableUnitSuspensionHistoryResponse,
    ServiceProvidingGroupCreateRequest,
    ServiceProvidingGroupProductApplicationCreateRequest,
    ServiceProvidingGroupProductApplicationResponse,
    ServiceProvidingGroupMembershipCreateRequest,
    ServiceProvidingGroupMembershipResponse,
)
from flex.api.controllable_unit_suspension import (
    list_controllable_unit_suspension,
    read_controllable_unit_suspension,
    update_controllable_unit_suspension,
    create_controllable_unit_suspension,
    delete_controllable_unit_suspension,
    list_controllable_unit_suspension_history,
    read_controllable_unit_suspension_history,
)
from flex.api.service_providing_group_membership import (
    create_service_providing_group_membership,
)
from flex.api.service_providing_group import (
    read_service_providing_group,
    update_service_providing_group,
)
from flex.models import (
    ServiceProvidingGroupUpdateRequest,
    ServiceProvidingGroupStatus,
    SystemOperatorProductTypeCreateRequest,
    SystemOperatorProductTypeResponse,
    ServiceProviderProductApplicationCreateRequest,
    ServiceProviderProductApplicationResponse,
    ServiceProviderProductApplicationUpdateRequest,
    ServiceProviderProductApplicationStatus,
)


from flex.api.service_providing_group_product_application import (
    create_service_providing_group_product_application,
)
from flex.api.system_operator_product_type import (
    create_system_operator_product_type,
)
from flex.api.service_provider_product_application import (
    create_service_provider_product_application,
    update_service_provider_product_application,
)

from flex.api.service_providing_group import (
    create_service_providing_group,
)

from flex.api.controllable_unit import (
    create_controllable_unit,
)
from flex.api.controllable_unit_service_provider import (
    create_controllable_unit_service_provider,
)
from typing import cast
import pytest


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

    yield (sts, cu.id, (client_so, so_id), (client_sp, sp_id))


# ---- ---- ---- ---- ----


def check_history(client, cus_id):
    # endpoint: GET /controllable_unit_suspension_history
    hist = list_controllable_unit_suspension_history.sync(
        client=client,
        controllable_unit_suspension_id=f"eq.{cus_id}",
    )
    assert isinstance(hist, list)
    assert len(hist) > 0

    # endpoint: GET /controllable_unit_suspension_history/{id}
    hist_cus = read_controllable_unit_suspension_history.sync(
        client=client,
        id=cast(int, hist[0].id),
    )
    assert isinstance(
        hist_cus,
        ControllableUnitSuspensionHistoryResponse,
    )


# RLS: CUS-FISO001
def test_cus_fiso(data):
    (sts, cu_id, (_, so_id), _) = data

    client_fiso = sts.fresh_client(TestEntity.TEST, "FISO")

    # endpoint: POST /service_providing_group_grid_suspension
    cus = create_controllable_unit_suspension.sync(
        client=client_fiso,
        body=ControllableUnitSuspensionCreateRequest(
            controllable_unit_id=cu_id,
            impacted_system_operator_id=so_id,
            reason=ControllableUnitSuspensionReason.OTHER,
        ),
    )
    assert isinstance(cus, ControllableUnitSuspensionResponse)

    # endpoint: GET /service_providing_group_grid_suspension
    cuss = list_controllable_unit_suspension.sync(client=client_fiso)
    assert isinstance(cuss, list)
    assert len(cuss) > 0

    # endpoint: GET /service_providing_group_grid_suspension/{id}
    s = read_controllable_unit_suspension.sync(
        client=client_fiso,
        id=cast(int, cuss[0].id),
    )
    assert isinstance(s, ControllableUnitSuspensionResponse)

    # RLS: CUS-FISO002
    check_history(client_fiso, s.id)

    # endpoint: PATCH /service_providing_group_grid_suspension/{id}
    u = update_controllable_unit_suspension.sync(
        client=client_fiso,
        id=cast(int, s.id),
        body=ControllableUnitSuspensionUpdateRequest(
            reason=ControllableUnitSuspensionReason.OTHER,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # endpoint: DELETE /service_providing_group_grid_suspension/{id}
    d = delete_controllable_unit_suspension.sync(
        client=client_fiso, id=cast(int, s.id), body=EmptyObject()
    )
    assert not isinstance(d, ErrorMessage)

    check_history(client_fiso, s.id)


def test_cus_so(data):
    (sts, cu_id, (client_so, so_id), (client_sp, sp_id)) = data

    # RLS: CUS-SO001
    # SO can create a suspension for a CU that impacts them

    cus = create_controllable_unit_suspension.sync(
        client=client_so,
        body=ControllableUnitSuspensionCreateRequest(
            impacted_system_operator_id=so_id,
            controllable_unit_id=cu_id,
            reason=ControllableUnitSuspensionReason.OTHER,
        ),
    )
    assert isinstance(cus, ControllableUnitSuspensionResponse)

    cuss = list_controllable_unit_suspension.sync(client=client_so)
    assert isinstance(cuss, list)
    assert len(cuss) > 0

    s = read_controllable_unit_suspension.sync(
        client=client_so,
        id=cast(int, cuss[0].id),
    )
    assert isinstance(s, ControllableUnitSuspensionResponse)

    # RLS: CUS-SO002
    check_history(client_so, s.id)

    u = update_controllable_unit_suspension.sync(
        client=client_so,
        id=cast(int, s.id),
        body=ControllableUnitSuspensionUpdateRequest(
            reason=ControllableUnitSuspensionReason.OTHER,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # RLS: CUS-SO003

    client_fiso = sts.fresh_client(TestEntity.TEST, "FISO")
    client_so2 = sts.fresh_client(TestEntity.COMMON, "SO")
    so2_id = sts.get_userinfo(client_so2)["party_id"]

    client_sp = sts.fresh_client(TestEntity.TEST, "SP")
    sp_id = sts.get_userinfo(client_sp)["party_id"]

    # create CU and SPG, link CU to SP in charge of the SPG,
    # add CU to SPG, mark SO as impacted for SPG

    cu = create_controllable_unit.sync(
        client=client_sp,
        body=ControllableUnitCreateRequest(
            name="TEST-CU-18",
            accounting_point_id=1002,
            regulation_direction=ControllableUnitRegulationDirection.UP,
            maximum_available_capacity=2,
        ),
    )
    assert isinstance(cu, ControllableUnitResponse)

    spg = create_service_providing_group.sync(
        client=client_fiso,
        body=ServiceProvidingGroupCreateRequest(
            service_provider_id=sp_id,
            name="New group",
        ),
    )
    assert isinstance(spg, ServiceProvidingGroupResponse)

    cus = create_controllable_unit_suspension.sync(
        client=client_so,
        body=ControllableUnitSuspensionCreateRequest(
            impacted_system_operator_id=so_id,
            controllable_unit_id=cast(int, cu.id),
            reason=ControllableUnitSuspensionReason.OTHER,
        ),
    )
    assert isinstance(cus, ControllableUnitSuspensionResponse)

    # SO cannot read the SPG yet (cf SPG RLS below)
    err = read_service_providing_group.sync(
        client=client_so2,
        id=cast(int, spg.id),
    )
    assert isinstance(err, ErrorMessage)

    spgm = create_service_providing_group_membership.sync(
        client=client_fiso,
        body=ServiceProvidingGroupMembershipCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_providing_group_id=cast(int, spg.id),
            valid_from="2024-01-01T00:00:00+1",
        ),
    )
    assert isinstance(spgm, ServiceProvidingGroupMembershipResponse)

    u = update_service_providing_group.sync(
        client=client_fiso,
        id=cast(int, spg.id),
        body=ServiceProvidingGroupUpdateRequest(
            status=ServiceProvidingGroupStatus.ACTIVE,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    pt_ids = [5, 7]

    sopt5 = create_system_operator_product_type.sync(
        client=client_so2,
        body=SystemOperatorProductTypeCreateRequest(
            system_operator_id=so2_id,
            product_type_id=5,
        ),
    )
    assert isinstance(sopt5, SystemOperatorProductTypeResponse)

    sopt7 = create_system_operator_product_type.sync(
        client=client_so2,
        body=SystemOperatorProductTypeCreateRequest(
            system_operator_id=so2_id,
            product_type_id=7,
        ),
    )
    assert isinstance(sopt7, SystemOperatorProductTypeResponse)

    sppa = create_service_provider_product_application.sync(
        client=client_sp,
        body=ServiceProviderProductApplicationCreateRequest(
            service_provider_id=sp_id,
            system_operator_id=so2_id,
            product_type_ids=pt_ids,
        ),
    )

    assert isinstance(sppa, ServiceProviderProductApplicationResponse)

    u = update_service_provider_product_application.sync(
        client=client_so2,
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
            service_providing_group_id=cast(int, spg.id),
            procuring_system_operator_id=so2_id,
            product_type_ids=pt_ids,
        ),
    )
    assert isinstance(spgpa, ServiceProvidingGroupProductApplicationResponse)

    u = update_service_provider_product_application.sync(
        client=client_so2,
        id=cast(int, sppa.id),
        body=ServiceProviderProductApplicationUpdateRequest(
            status=ServiceProviderProductApplicationStatus.QUALIFIED,
            qualified_at="2024-01-01T00:00:00+1",
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # SO can read the SPG now
    s = read_controllable_unit_suspension.sync(
        client=client_so2,
        id=cast(int, cus.id),
    )
    assert isinstance(s, ControllableUnitSuspensionResponse)

    # RLS: CUS-SO004
    check_history(client_so2, s.id)


def test_cus_sp(data):
    (sts, _, _, (client_sp, sp_id)) = data

    # RLS: CUS-SP001
    # SP can read suspensions for CUs they have a contract with

    client_old_sp = sts.fresh_client(TestEntity.TEST, "SP")
    old_sp_id = sts.get_userinfo(client_old_sp)["party_id"]

    client_fiso = sts.fresh_client(TestEntity.TEST, "FISO")
    client_so = sts.fresh_client(TestEntity.TEST, "SO")

    client_eu = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST, "EU"))
    eu_id = sts.get_userinfo(client_eu)["party_id"]

    cu = create_controllable_unit.sync(
        client=client_fiso,
        body=ControllableUnitCreateRequest(
            name="CU-SUSP-1",
            accounting_point_id=1002,
            regulation_direction=ControllableUnitRegulationDirection.BOTH,
            maximum_available_capacity=3.5,
        ),
    )
    assert isinstance(cu, ControllableUnitResponse)

    old_cu_sp = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_provider_id=old_sp_id,
            end_user_id=eu_id,
            contract_reference="TEST-CONTRACT-SUSP-OLD-1",
            valid_from="2024-05-01 Europe/Oslo",
            valid_to="2024-06-01 Europe/Oslo",
        ),
    )
    assert isinstance(old_cu_sp, ControllableUnitServiceProviderResponse)

    cus = create_controllable_unit_suspension.sync(
        client=client_fiso,
        body=ControllableUnitSuspensionCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            impacted_system_operator_id=sts.get_userinfo(client_so)["party_id"],
            reason=ControllableUnitSuspensionReason.OTHER,
        ),
    )
    assert isinstance(cus, ControllableUnitSuspensionResponse)

    r = read_controllable_unit_suspension.sync(
        client=client_old_sp,
        id=cast(int, cus.id),
    )
    assert isinstance(r, ErrorMessage)

    cu_sp = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            service_provider_id=sp_id,
            end_user_id=eu_id,
            contract_reference="TEST-CONTRACT-SUSP-OLD-1",
            valid_from="2024-07-01 Europe/Oslo",
        ),
    )
    assert isinstance(cu_sp, ControllableUnitServiceProviderResponse)

    cus = create_controllable_unit_suspension.sync(
        client=client_fiso,
        body=ControllableUnitSuspensionCreateRequest(
            controllable_unit_id=cast(int, cu.id),
            impacted_system_operator_id=sts.get_userinfo(client_so)["party_id"],
            reason=ControllableUnitSuspensionReason.OTHER,
        ),
    )
    assert isinstance(cus, ControllableUnitSuspensionResponse)

    r = read_controllable_unit_suspension.sync(
        client=client_sp,
        id=cast(int, cus.id),
    )
    assert isinstance(r, ControllableUnitSuspensionResponse)

    d = delete_controllable_unit_suspension.sync(
        client=client_sp,
        id=cast(int, r.id),
        body=EmptyObject(),
    )
    assert isinstance(d, ErrorMessage)

    # RLS: CUS-SP002
    check_history(client_sp, r.id)
