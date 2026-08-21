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


# the `!` join hint (rewritten to PostgREST's `!inner`) must restrict the
# parent (controllable_unit) rows, not just the embedded rows, when filtering
# on a column of the embedded resource
def test_embed_inner_join_hint_filters_parent_rows(sts):
    client = sts.get_client(TestEntity.TEST, "FISO")

    all_cus = client.get_httpx_client().get(
        "/controllable_unit",
        params={"embed": "accounting_point!"},
    )
    assert all_cus.status_code == 200
    all_data = all_cus.json()
    assert len(all_data) > 1
    unique_suffix = all_data[0]["accounting_point"]["business_id"][-6:]

    response = client.get_httpx_client().get(
        "/controllable_unit",
        params={
            "embed": "accounting_point!",
            "accounting_point.business_id": f"ilike.*{unique_suffix}*",
        },
    )

    assert response.status_code == 200
    filtered_data = response.json()
    assert 0 < len(filtered_data) < len(all_data)
    for row in filtered_data:
        assert unique_suffix in row["accounting_point"]["business_id"]
