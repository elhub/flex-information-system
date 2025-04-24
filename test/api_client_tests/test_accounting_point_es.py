from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    AccountingPointEnergySupplierResponse,
)
from flex.api.accounting_point_balance_responsible_party import (
    list_accounting_point_balance_responsible_party,
)
from flex.api.accounting_point_energy_supplier import (
    list_accounting_point_energy_supplier,
)
from typing import cast

import pytest


@pytest.fixture
def sts():
    yield SecurityTokenService()


# RLS: APES-BRP001
def test_apes_brp(sts):
    client_brp = sts.get_client(TestEntity.TEST, "BRP")

    # check they can read APES on AP they are related to right now

    apbrps = list_accounting_point_balance_responsible_party.sync(
        client=client_brp,
    )
    assert isinstance(apbrps, list)
    assert len(apbrps) > 0

    current_apbrps = [apbrp for apbrp in apbrps if apbrp.valid_to is None]
    assert len(current_apbrps) > 0

    # endpoint: GET /accounting_point_energy_supplier
    apess = list_accounting_point_energy_supplier.sync(
        client=client_brp,
    )
    assert isinstance(apess, list)
    assert len(apess) > 0

    for apbrp in current_apbrps[:5]:
        assert any(
            apes.accounting_point_id == apbrp.accounting_point_id for apes in apess
        )


# RLS: APES-EU001
def test_apes_eu(sts):
    client_eu = sts.get_client(TestEntity.TEST, "EU")

    # check they can read APES on AP they are end user for right now

    apess = list_accounting_point_energy_supplier.sync(client=client_eu)
    assert isinstance(apess, list)
    assert len(apess) > 0
    for apes in apess[:5]:
        assert cast(int, apes.accounting_point_id) > 1000  # cf test for AP-EU001


# RLS: APES-ES001
def test_apes_es(sts):
    client_es = sts.get_client(TestEntity.TEST, "ES")

    es_id = sts.get_userinfo(client_es)["party_id"]

    # check they can read APES when they are the ES

    apess = list_accounting_point_energy_supplier.sync(
        client=client_es,
    )
    assert isinstance(apess, list)
    assert len(apess) > 0

    for apes in apess[:5]:
        assert isinstance(apes, AccountingPointEnergySupplierResponse)
        assert apes.energy_supplier_id == es_id


# RLS: APES-SP001
def test_apes_sp(sts):
    pass
    # client_sp = sts.get_client(TestEntity.TEST, "SP")

    # check they can read APES on AP where they have CU right now

    # apess = list_accounting_point_energy_supplier.sync(client=client_sp)
    # assert isinstance(apess, list)
    # assert len(apess) > 0

    # cusps = list_controllable_unit_service_provider.sync(client=client_sp)
    # assert isinstance(cusps, list)
    # assert len(cusps) > 0

    # for cusp in [cusp for cusp in cusps if cusp.valid_to is None][:5]:
    #     cu = read_controllable_unit.sync(
    #         client=client_sp,
    #         id=cast(int, cusp.controllable_unit_id),
    #     )
    #     assert isinstance(cu, ControllableUnitResponse)

    #     ap = list_accounting_point.sync(client=client_sp)
    #     assert isinstance(ap, list)

    #     assert any(
    #         apes.accounting_point_id == cu.accounting_point_id
    #         for apes in apess
    #     )
