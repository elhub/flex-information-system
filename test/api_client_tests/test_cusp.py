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
from datetime import date, datetime, timedelta, time, timezone


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
            contract_reference="TEST-CONTRACT",
            valid_from="2020-01-01T00:00:00+1",
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
            valid_to="2020-01-02T00:00:00+1",
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

    sp1_client = sts.get_client(TestEntity.TEST, "SP")
    sp1_id = sts.get_userinfo(sp1_client)["party_id"]

    sp2_client = sts.get_client(TestEntity.COMMON, "SP")
    sp2_id = sts.get_userinfo(sp2_client)["party_id"]

    # SP can do CU-SP without seeing the CU, they just need the ID
    cu = read_controllable_unit.sync(client=sp1_client, id=cu_id)
    assert isinstance(cu, ErrorMessage)

    # check SP can read the CU-SP relations they are responsible for

    cusps_sp = list_controllable_unit_service_provider.sync(
        client=sp1_client,
    )
    assert isinstance(cusps_sp, list)
    assert len(cusps_sp) > 0

    def midnight_n_days_diff(n):
        return (
            datetime.combine(date.today() + timedelta(days=n), time.min)
            .astimezone(tz=timezone.utc)
            .isoformat()
        )

    # SP can add CU-SP for current date when the CU is empty

    cusp = create_controllable_unit_service_provider.sync(
        client=sp1_client,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cu_id,
            service_provider_id=sp1_id,
            contract_reference="TEST-CONTRACT",
            valid_from=midnight_n_days_diff(-5),
        ),
    )
    assert isinstance(cusp, ControllableUnitServiceProviderResponse)

    # but not if there is already a CU-SP relation

    cusp = create_controllable_unit_service_provider.sync(
        client=sp1_client,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cu_id,
            service_provider_id=sp1_id,
            contract_reference="TEST-CONTRACT",
            valid_from=midnight_n_days_diff(1),
        ),
    )
    assert isinstance(cusp, ErrorMessage)

    # another SP cannot add a CU-SP relation

    cusp = create_controllable_unit_service_provider.sync(
        client=sp2_client,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cu_id,
            service_provider_id=sp2_id,
            contract_reference="TEST-CONTRACT",
            valid_from=midnight_n_days_diff(0),
        ),
    )
    assert isinstance(cusp, ErrorMessage)

    # but they can insert in a 2-4 weeks window ahead of time

    cusp = create_controllable_unit_service_provider.sync(
        client=sp1_client,
        body=ControllableUnitServiceProviderCreateRequest(
            controllable_unit_id=cu_id,
            service_provider_id=sp1_id,
            contract_reference="TEST-CONTRACT",
            valid_from=midnight_n_days_diff(16),
        ),
    )
    assert isinstance(cusp, ControllableUnitServiceProviderResponse)

    # they can update in a 2-week window

    u = update_controllable_unit_service_provider.sync(
        client=sp1_client,
        id=cast(int, cusp.id),
        body=ControllableUnitServiceProviderUpdateRequest(
            valid_from=midnight_n_days_diff(-10),
            valid_to=midnight_n_days_diff(-7),
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    # but not too far in the past

    u = update_controllable_unit_service_provider.sync(
        client=sp1_client,
        id=cast(int, cusp.id),
        body=ControllableUnitServiceProviderUpdateRequest(
            valid_from=midnight_n_days_diff(-17),
        ),
    )
    assert isinstance(u, ErrorMessage)

    d = delete_controllable_unit_service_provider.sync(
        client=sp1_client, id=cast(int, cusp.id), body=EmptyObject()
    )
    assert not (isinstance(d, ErrorMessage))

    # but they cannot touch the old records

    cusp = cusps_sp[0]
    assert isinstance(cusp, ControllableUnitServiceProviderResponse)

    u = update_controllable_unit_service_provider.sync(
        client=sp1_client,
        id=cast(int, cusp.id),
        body=ControllableUnitServiceProviderUpdateRequest(
            valid_to=midnight_n_days_diff(0),
        ),
    )
    assert isinstance(u, ErrorMessage)


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


# RLS: CUSP-FISO002
# RLS: CUSP-SO002
# RLS: CUSP-SP002
def test_cusp_history(data):
    (sts, _) = data

    for role in ["FISO", "SO", "SP"]:
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


# RLS: CUSP-EU001
# RLS: CUSP-EU002
def test_cusp_eu(data):
    (sts, _) = data

    # former AP end user can see the old version of the CU-SPs in the test data,
    # but not the current contracts

    client_former_eu = sts.get_client(TestEntity.COMMON, "EU")

    cusphs_former_eu = list_controllable_unit_service_provider_history.sync(
        client=client_former_eu,
    )
    assert isinstance(cusphs_former_eu, list)

    assert len(cusphs_former_eu) > 0

    old_cusphs = list(
        filter(
            lambda cusph: str(cusph.valid_to).startswith("2023"),
            cusphs_former_eu,
        )
    )

    assert len(old_cusphs) > 0

    cusp = read_controllable_unit_service_provider.sync(
        client=client_former_eu,
        id=cast(int, old_cusphs[0].controllable_unit_service_provider_id),
    )
    assert isinstance(cusp, ErrorMessage)

    # current AP end user can see the current version of the CU-SP contract,
    # but not the old records

    client_eu = sts.get_client(TestEntity.TEST, "EU")

    cusp = read_controllable_unit_service_provider.sync(
        client=client_eu,
        id=cast(int, old_cusphs[0].controllable_unit_service_provider_id),
    )
    assert isinstance(cusp, ControllableUnitServiceProviderResponse)

    cusphs_eu = list_controllable_unit_service_provider_history.sync(
        client=client_eu,
    )
    assert isinstance(cusphs_eu, list)

    old_cusphs = list(
        filter(
            lambda cusph: str(cusph.valid_to).startswith("2023"),
            cusphs_eu,
        )
    )
    assert len(old_cusphs) == 0


def test_rla_absence(data):
    (sts, _) = data

    roles_without_rla = ["BRP", "ES", "MO", "TP"]

    for role in roles_without_rla:
        cusps = list_controllable_unit_service_provider.sync(
            client=sts.get_client(TestEntity.TEST, role),
        )
        assert isinstance(cusps, list)
        assert len(cusps) == 0
