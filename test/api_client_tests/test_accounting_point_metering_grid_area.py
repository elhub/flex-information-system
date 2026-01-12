from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import AccountingPointMeteringGridAreaResponse
from flex.api.accounting_point_metering_grid_area import (
    list_accounting_point_metering_grid_area,
)

import pytest


@pytest.fixture
def sts():
    yield SecurityTokenService()


# RLS: APMGA-FISO001
def test_accounting_point_metering_grid_area_fiso(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # endpoint: GET /accounting_point_metering_grid_area
    apmga = list_accounting_point_metering_grid_area.sync(
        client=client_fiso,
        limit="10000",
    )
    assert isinstance(apmga, list)
    assert len(apmga) == 3000
    assert isinstance(apmga[0], AccountingPointMeteringGridAreaResponse)


def test_rla_absence(sts):
    roles_without_rla = ["BRP", "EU", "ES", "MO", "SO", "SP", "TP"]

    for role in roles_without_rla:
        apmga = list_accounting_point_metering_grid_area.sync(
            client=sts.get_client(TestEntity.TEST, role),
        )
        assert isinstance(apmga, list)
        assert len(apmga) == 0
