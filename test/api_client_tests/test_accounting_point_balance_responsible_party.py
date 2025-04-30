from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.api.accounting_point_balance_responsible_party import (
    list_accounting_point_balance_responsible_party,
)

import pytest


@pytest.fixture
def sts():
    yield SecurityTokenService()


# RLS: APBRP-FISO001
def test_apbrp_brp(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # check they can read all APBRP

    # endpoint: GET /accounting_point_balance_responsible_party
    apbrps = list_accounting_point_balance_responsible_party.sync(
        client=client_fiso,
    )
    assert isinstance(apbrps, list)
    assert len(apbrps) == 4000  # all APBRP in the test data


# RLS: APBRP-SP001
def test_apbrp_sp(sts):
    pass
