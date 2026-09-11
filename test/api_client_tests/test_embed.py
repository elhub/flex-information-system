from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
import datetime
import pytest


@pytest.fixture
def sts():
    yield SecurityTokenService()


def test_embed_accounting_point_bidding_zone_is_list(sts):
    client = sts.get_client(TestEntity.TEST, "FISO")

    today = datetime.datetime.now(datetime.timezone.utc).isoformat()

    response = client.get_httpx_client().get(
        "/controllable_unit/1",
        params={
            "embed": "accounting_point(bidding_zone,balance_responsible_party(balance_responsible_party))",
            "accounting_point.bidding_zone.valid_at": today,
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["accounting_point"]["bidding_zone"], list)
