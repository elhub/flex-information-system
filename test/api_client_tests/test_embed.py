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


def test_embed_history_from_current(sts):
    client = sts.get_client(TestEntity.TEST, "FISO")

    response = client.get_httpx_client().get(
        "/service_providing_group_membership/1",
        params={"embed": "controllable_unit_history"},
    )

    assert response.status_code == 200
    data = response.json()
    # all the versions of the controllable unit, not just the current one
    assert isinstance(data["controllable_unit_history"], list)
    assert len(data["controllable_unit_history"]) > 1
    assert all(
        version["controllable_unit_id"] == data["controllable_unit_id"]
        for version in data["controllable_unit_history"]
    )


def test_embed_current_from_history(sts):
    client = sts.get_client(TestEntity.TEST, "FISO")

    response = client.get_httpx_client().get(
        "/service_providing_group_membership_history",
        params={
            "service_providing_group_membership_id": "eq.1",
            "embed": "controllable_unit",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    for membership in data:
        assert (
            membership["controllable_unit"]["id"] == membership["controllable_unit_id"]
        )
