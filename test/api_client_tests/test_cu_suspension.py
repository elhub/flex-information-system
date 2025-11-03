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
    ErrorMessage,
    EmptyObject,
)

from flex.models import (
    ControllableUnitSuspensionCreateRequest,
    ControllableUnitSuspensionResponse,
    ControllableUnitSuspensionReason,
    ControllableUnitSuspensionUpdateRequest,
    ControllableUnitSuspensionHistoryResponse,
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

    yield (sts, cu.id, so_id, client_sp, sp_id)


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
    hist_spggs = read_controllable_unit_suspension_history.sync(
        client=client,
        id=cast(int, hist[0].id),
    )
    assert isinstance(
        hist_spggs,
        ControllableUnitSuspensionHistoryResponse,
    )


# RLS: CUS-FISO001
def test_cus_fiso(data):
    (sts, cu_id, so_id, _, _) = data

    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

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


def test_cus_so(data):
    (sts, cu_id, so_id, _, _) = data

    # RLS: CUS-SO001
    # SO can create a suspension for a CU that impacts them

    client_so = sts.get_client(TestEntity.TEST, "SO")

    # endpoint: POST /service_providing_group_grid_suspension
    cus = create_controllable_unit_suspension.sync(
        client=client_so,
        body=ControllableUnitSuspensionCreateRequest(
            impacted_system_operator_id=so_id,
            controllable_unit_id=cu_id,
            reason=ControllableUnitSuspensionReason.OTHER,
        ),
    )
    assert isinstance(cus, ControllableUnitSuspensionResponse)

    # endpoint: GET /controllable_unit_suspension_suspension
    cuss = list_controllable_unit_suspension.sync(client=client_so)
    assert isinstance(cuss, list)
    assert len(cuss) > 0

    # endpoint: GET /controllable_unit_suspension_suspension/{id}
    s = read_controllable_unit_suspension.sync(
        client=client_so,
        id=cast(int, cuss[0].id),
    )
    assert isinstance(s, ControllableUnitSuspensionResponse)

    # RLS: CUS-SO002
    check_history(client_so, s.id)

    # endpoint: PATCH /controllable_unit_suspension_suspension/{id}
    u = update_controllable_unit_suspension.sync(
        client=client_so,
        id=cast(int, s.id),
        body=ControllableUnitSuspensionUpdateRequest(
            reason=ControllableUnitSuspensionReason.OTHER,
        ),
    )
    assert not isinstance(u, ErrorMessage)

    # RLS: CUS-SO003

    # endpoint: GET /controllable_unit_suspension_suspension/{id}
    r = read_controllable_unit_suspension.sync(
        client=client_so,
        id=cast(int, s.id),
    )
    assert isinstance(r, ControllableUnitSuspensionResponse)
    assert r.impacted_system_operator_id == so_id

    # RLS: CUS-SO004
    check_history(client_so, s.id)


def test_cus_sp(data):
    (_, _, _, client_sp, _) = data

    # RLS: CUS-SP001
    # SP can read suspensions for CUs they have a contract with

    # endpoint: GET /controllable_unit_suspension_suspension
    cus = list_controllable_unit_suspension.sync(client=client_sp)
    assert isinstance(cus, list)

    if len(cus) > 0:
        # endpoint: GET /controllable_unit_suspension_suspension/{id}
        s = read_controllable_unit_suspension.sync(
            client=client_sp,
            id=cast(int, cus[0].id),
        )
        assert isinstance(s, ControllableUnitSuspensionResponse)

        # RLS: CUS-SP002
        check_history(client_sp, s.id)
