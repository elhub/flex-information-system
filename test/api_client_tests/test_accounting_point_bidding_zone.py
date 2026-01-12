from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import AccountingPointBiddingZoneResponse
from flex.api.accounting_point_bidding_zone import (
    list_accounting_point_bidding_zone,
)

import pytest


@pytest.fixture
def sts():
    yield SecurityTokenService()


# RLS: APBZ-FISO001
def test_accounting_point_bidding_zone_fiso(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # endpoint: GET /accounting_point_bidding_zone
    apbz = list_accounting_point_bidding_zone.sync(
        client=client_fiso,
        limit="10000",
    )
    assert isinstance(apbz, list)
    assert len(apbz) >= 3000
    assert isinstance(apbz[0], AccountingPointBiddingZoneResponse)


def test_rla_absence(sts):
    roles_without_rla = ["BRP", "EU", "ES", "MO", "SO", "SP", "TP"]

    for role in roles_without_rla:
        apbz = list_accounting_point_bidding_zone.sync(
            client=sts.get_client(TestEntity.TEST, role),
        )
        assert isinstance(apbz, list)
        assert len(apbz) == 0
