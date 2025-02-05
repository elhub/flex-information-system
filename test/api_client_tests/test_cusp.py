from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    ControllableUnitServiceProviderResponse,
    ControllableUnitServiceProviderCreateRequest,
    ControllableUnitServiceProviderUpdateRequest,
    ControllableUnitServiceProviderHistoryResponse,
    ErrorMessage,
    EmptyObject,
    ControllableUnitResponse,
    ControllableUnitCreateRequest,
    ControllableUnitRegulationDirection,
)
from flex.api.controllable_unit import (
    create_controllable_unit,
    read_controllable_unit,
)
from flex.api.controllable_unit_service_provider import (
    list_controllable_unit_service_provider,
    create_controllable_unit_service_provider,
    update_controllable_unit_service_provider,
    read_controllable_unit_service_provider,
    delete_controllable_unit_service_provider,
    read_controllable_unit_service_provider_history,
    list_controllable_unit_service_provider_history,
)
import pytest
from typing import cast


@pytest.fixture
def data():
    sts = SecurityTokenService()
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # Create new controllable unit to play with
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

    yield (sts, cu.id)


# ---- ---- ---- ---- ----


# RLS: CUSP-FISO001
def test_cusp_fiso(data):
    (sts, cu_id) = data
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # create a CU-SP relation, check the visible list is one relation longer

    # endpoint: GET /controllable_unit_service_provider
    cusps = list_controllable_unit_service_provider.sync(
        client=client_fiso,
    )
    assert isinstance(cusps, list)

    client_sp = sts.get_client(TestEntity.TEST, "SP")
    sp_id = sts.get_userinfo(client_sp)["party_id"]

    # endpoint: POST /controllable_unit_service_provider
    cusp = create_controllable_unit_service_provider.sync(
        client=client_fiso,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cu_id,
            service_provider_id=sp_id,
            valid_from="2020-01-01T10:00:00+00:00",
            valid_to=None,
        ),
    )
    assert isinstance(cusp, ControllableUnitServiceProviderResponse)

    cusps2 = list_controllable_unit_service_provider.sync(
        client=client_fiso,
    )
    assert isinstance(cusps2, list)
    assert len(cusps2) == len(cusps) + 1

    # endpoint: GET /controllable_unit_service_provider/{id}
    cusp = read_controllable_unit_service_provider.sync(
        client=client_fiso, id=cast(int, cusp.id)
    )
    assert isinstance(cusp, ControllableUnitServiceProviderResponse)

    cusp2 = list_controllable_unit_service_provider.sync(
        client=client_fiso,
        controllable_unit_id=f"eq.{cu_id}",
        service_provider_id=f"eq.{sp_id}",
    )
    assert isinstance(cusp2, list)
    assert len(cusp2) >= 1

    # update the relation and check the history is one record longer

    # endpoint: GET /controllable_unit_service_provider_history
    hist = list_controllable_unit_service_provider_history.sync(client=client_fiso)
    assert isinstance(hist, list)
    hist_size = len(
        list(
            filter(
                lambda h: cast(
                    ControllableUnitServiceProviderHistoryResponse, h
                ).controllable_unit_id
                == cast(
                    ControllableUnitServiceProviderResponse, cusp
                ).controllable_unit_id
                and cast(
                    ControllableUnitServiceProviderHistoryResponse, h
                ).service_provider_id
                == sp_id,
                hist,
            )
        )
    )

    # endpoint: PATCH /controllable_unit_service_provider/{id}
    u = update_controllable_unit_service_provider.sync(
        client=client_fiso,
        id=cast(int, cusp.id),
        body=ControllableUnitServiceProviderUpdateRequest(
            valid_to="2020-01-01T14:00:00+00:00",
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    hist = list_controllable_unit_service_provider_history.sync(client=client_fiso)
    assert isinstance(hist, list)
    hist_size2 = len(
        list(
            filter(
                lambda h: cast(
                    ControllableUnitServiceProviderHistoryResponse, h
                ).controllable_unit_id
                == cast(
                    ControllableUnitServiceProviderResponse, cusp
                ).controllable_unit_id
                and cast(
                    ControllableUnitServiceProviderHistoryResponse, h
                ).service_provider_id
                == sp_id,
                hist,
            )
        )
    )
    assert hist_size2 == hist_size + 1

    # endpoint: GET /controllable_unit_service_provider_history/{id}
    h = read_controllable_unit_service_provider_history.sync(
        client=client_fiso, id=cast(int, hist[0].id)
    )
    assert isinstance(h, ControllableUnitServiceProviderHistoryResponse)

    h2 = list_controllable_unit_service_provider_history.sync(
        client=client_fiso,
        controllable_unit_service_provider_id=f"eq.{cusp.id}",
    )
    assert isinstance(h2, list)
    assert len(h2) > 0

    # endpoint: DELETE /controllable_unit_service_provider/{id}
    d = delete_controllable_unit_service_provider.sync(
        client=client_fiso, id=cast(int, cusp.id), body=EmptyObject()
    )
    assert not (isinstance(d, ErrorMessage))


# RLS: CUSP-SP001
def test_cusp_sp(data):
    (sts, cu_id) = data

    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    client_sp = sts.get_client(TestEntity.TEST, "SP")
    sp_id = sts.get_userinfo(client_sp)["party_id"]

    # check SP can CRUD the CU-SP relations they are responsible for

    cusps_sp = list_controllable_unit_service_provider.sync(
        client=client_sp,
    )
    assert isinstance(cusps_sp, list)
    assert len(cusps_sp) > 0

    cusp = create_controllable_unit_service_provider.sync(
        client=client_sp,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cu_id,
            service_provider_id=sp_id,
            valid_from="2010-01-01T10:00:00+00:00",
            valid_to="2010-01-01T10:10:00+00:00",
        ),
    )
    assert isinstance(cusp, ControllableUnitServiceProviderResponse)

    u = update_controllable_unit_service_provider.sync(
        client=client_fiso,
        id=cast(int, cusp.id),
        body=ControllableUnitServiceProviderUpdateRequest(
            valid_to="2010-01-01T14:00:00+00:00",
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    d = delete_controllable_unit_service_provider.sync(
        client=client_fiso, id=cast(int, cusp.id), body=EmptyObject()
    )
    assert not (isinstance(d, ErrorMessage))


# RLS: CUSP-SO001
def test_cusp_so(data):
    (sts, _) = data
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    client_so = sts.get_client(TestEntity.TEST, "SO")

    so_id = sts.get_userinfo(client_so)["party_id"]

    cusps = list_controllable_unit_service_provider.sync(client=client_fiso)
    assert isinstance(cusps, list)
    cusps_where_so_is_cso = []
    for cusp in cusps:
        cu = read_controllable_unit.sync(
            client=client_fiso, id=cast(int, cusp.controllable_unit_id)
        )
        assert isinstance(cu, ControllableUnitResponse)
        if cu.connecting_system_operator_id == so_id:
            cusps_where_so_is_cso.append(cusp)

    # SO can read the CUs where they are CSO
    for cusp in cusps_where_so_is_cso:
        cu = read_controllable_unit.sync(
            client=client_so, id=cast(int, cusp.controllable_unit_id)
        )
        assert isinstance(cu, ControllableUnitResponse)


# RLS: CUSP-COM001
def test_cusp_common(data):
    (sts, _) = data

    for role in sts.COMMON_ROLES:
        client = sts.get_client(TestEntity.TEST, role)

        # check a role can see the history for CUs they can see
        visible_cusps = list_controllable_unit_service_provider.sync(client=client)
        assert isinstance(visible_cusps, list)

        # only checking a few entries is sufficient
        for cusp in visible_cusps[:5]:
            hist = list_controllable_unit_service_provider_history.sync(
                client=client,
                controllable_unit_service_provider_id=f"eq.{cusp.id}",
            )
            assert isinstance(hist, list)
            assert len(hist) > 0


def test_rla_absence(data):
    (sts, _) = data

    roles_without_rla = ["BRP", "ES", "MO", "TP"]

    for role in roles_without_rla:
        cusps = list_controllable_unit_service_provider.sync(
            client=sts.get_client(TestEntity.TEST, role),
        )
        assert isinstance(cusps, list)
        assert len(cusps) == 0
