from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import MeteringGridAreaResponse, ErrorMessage
from flex.api.metering_grid_area import (
    list_metering_grid_area,
    read_metering_grid_area,
)
from typing import cast

import pytest


@pytest.fixture
def sts():
    yield SecurityTokenService()


# RLS: MGA-COM001
def test_metering_grid_area_common(sts):
    for role in sts.COMMON_ROLES:
        client = sts.get_client(TestEntity.TEST, role)

        # endpoint: GET /metering_grid_area
        mga = list_metering_grid_area.sync(client=client)
        assert isinstance(mga, list)
        assert len(mga) == 4  # i.e. 2 MGAs per test user, COMMON and TEST
        assert isinstance(mga[0], MeteringGridAreaResponse)

        # endpoint: GET /metering_grid_area/{id}
        mga = read_metering_grid_area.sync(
            client=client,
            id=cast(int, mga[0].id),
        )
        assert isinstance(mga, MeteringGridAreaResponse)


def test_metering_grid_area_anon(sts):
    client = sts.get_client()

    e = list_metering_grid_area.sync(client=client)
    assert isinstance(e, ErrorMessage)
    assert e.message.startswith("permission denied")
