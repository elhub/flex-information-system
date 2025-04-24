from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    AccountingPointBalanceResponsiblePartyResponse,
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


# RLS: APBRP-BRP001
def test_apbrp_brp(sts):
    client_brp = sts.get_client(TestEntity.TEST, "BRP")

    brp_id = sts.get_userinfo(client_brp)["party_id"]

    # check they can read APBRP when they are the BRP

    # endpoint: GET /accounting_point_balance_responsible_party
    apbrps = list_accounting_point_balance_responsible_party.sync(
        client=client_brp,
    )
    assert isinstance(apbrps, list)
    assert len(apbrps) > 0

    for apbrp in apbrps[:5]:
        assert isinstance(apbrp, AccountingPointBalanceResponsiblePartyResponse)
        assert apbrp.balance_responsible_party_id == brp_id


# RLS: APBRP-EU001
def test_apbrp_eu(sts):
    client_eu = sts.get_client(TestEntity.TEST, "EU")

    # check they can read APBRP on AP they are end user for right now

    apbrps = list_accounting_point_balance_responsible_party.sync(
        client=client_eu,
    )
    assert isinstance(apbrps, list)
    assert len(apbrps) > 0
    for apbrp in apbrps[:5]:
        assert cast(int, apbrp.accounting_point_id) > 1000  # cf test for AP-EU001


# RLS: APBRP-ES001
def test_apbrp_es(sts):
    client_es = sts.get_client(TestEntity.TEST, "ES")

    # check they can read APBRP on AP they are related to right now

    apess = list_accounting_point_energy_supplier.sync(
        client=client_es,
    )
    assert isinstance(apess, list)
    assert len(apess) > 0

    current_apess = [apes for apes in apess if apes.valid_to is None]
    assert len(current_apess) > 0

    apbrps = list_accounting_point_balance_responsible_party.sync(
        client=client_es,
    )
    assert isinstance(apbrps, list)
    assert len(apbrps) > 0

    for apes in current_apess[:5]:
        assert any(
            apbrp.accounting_point_id == apes.accounting_point_id for apbrp in apbrps
        )


# RLS: APBRP-SP001
def test_apbrp_sp(sts):
    pass
