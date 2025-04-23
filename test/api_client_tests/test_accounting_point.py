from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import AccountingPointResponse, ControllableUnitResponse
from flex.api.accounting_point import (
    list_accounting_point,
    read_accounting_point,
)
from flex.api.accounting_point_balance_responsible_party import (
    list_accounting_point_balance_responsible_party,
)
from flex.api.accounting_point_energy_supplier import (
    list_accounting_point_energy_supplier,
)
from flex.api.controllable_unit_service_provider import (
    list_controllable_unit_service_provider,
)
from flex.api.controllable_unit import (
    read_controllable_unit,
)
from typing import cast

import pytest


@pytest.fixture
def sts():
    yield SecurityTokenService()


# RLS: AP-BRP001
def test_accounting_point_brp(sts):
    client_brp = sts.get_client(TestEntity.TEST, "BRP")

    brp_id = sts.get_userinfo(client_brp)["party_id"]

    # check they can read APs they are related to

    apbrps = list_accounting_point_balance_responsible_party.sync(
        client=client_brp,
        balance_responsible_party_id=f"eq.{brp_id}",
    )
    assert isinstance(apbrps, list)
    assert len(apbrps) > 0

    for apbrp in apbrps[:5]:
        # endpoint: GET /accounting_point/{id}
        ap = read_accounting_point.sync(
            client=client_brp,
            id=cast(int, apbrp.accounting_point_id),
        )
        assert isinstance(ap, AccountingPointResponse)


# RLS: AP-EU001
def test_accounting_point_end_user(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    client_eu = sts.get_client(TestEntity.TEST, "EU")

    # check they can read APs they are related to

    # NB: as we do not open APEU to the API, we have no way to filter the APs
    # by end user there, so instead of opening the table just for this test,
    # we exploit the fact that all APs over 1000 get associated to the test end
    # user in the test data

    # RLS: AP-FISO001
    # endpoint: GET /accounting_point
    aps = list_accounting_point.sync(client=client_fiso, id="gt.1000")
    assert isinstance(aps, list)
    assert len(aps) > 0

    for ap in aps[:5]:
        ap = read_accounting_point.sync(client=client_eu, id=cast(int, ap.id))
        assert isinstance(ap, AccountingPointResponse)


# RLS: AP-ES001
def test_accounting_point_energy_supplier(sts):
    client_es = sts.get_client(TestEntity.TEST, "ES")

    es_id = sts.get_userinfo(client_es)["party_id"]

    # check they can read APs they are related to

    apess = list_accounting_point_energy_supplier.sync(
        client=client_es,
        energy_supplier_id=f"eq.{es_id}",
    )
    assert isinstance(apess, list)
    assert len(apess) > 0

    for apes in apess[:5]:
        ap = read_accounting_point.sync(
            client=client_es,
            id=cast(int, apes.accounting_point_id),
        )
        assert isinstance(ap, AccountingPointResponse)


# RLS: AP-SO001
def test_accounting_point_system_operator(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    client_so = sts.get_client(TestEntity.TEST, "SO")

    # check they can read APs where they are SO

    aps = list_accounting_point.sync(
        client=client_fiso,
        system_operator_id=f"eq.{sts.get_userinfo(client_so)['party_id']}",
    )
    assert isinstance(aps, list)
    assert len(aps) > 0

    for ap in aps[:5]:
        ap = read_accounting_point.sync(
            client=client_so,
            id=cast(int, ap.id),
        )
        assert isinstance(ap, AccountingPointResponse)


# RLS: AP-SP001
def test_accounting_point_service_provider(sts):
    client_sp = sts.get_client(TestEntity.TEST, "SP")

    # check they can read APs where they are related to a CU

    cusps = list_controllable_unit_service_provider.sync(client=client_sp)
    assert isinstance(cusps, list)
    assert len(cusps) > 0

    for cusp in cusps[:5]:
        cu = read_controllable_unit.sync(
            client=client_sp,
            id=cusp.controllable_unit_id,
        )
        assert isinstance(cu, ControllableUnitResponse)

        aps = list_accounting_point.sync(
            client=client_sp,
            business_id=f"eq.{cu.accounting_point_id}",
        )
        assert isinstance(aps, list)
        assert len(aps) == 1
