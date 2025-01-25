from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
import os
import requests
import pytest

"""Test of the userinfo endpoint"""


@pytest.fixture
def sts():
    yield SecurityTokenService()


auth_url = os.environ["FLEX_AUTH_BASE"] + "/auth/v0"

# ---- ---- ---- ----- -----


# Try to call userinfo without being logged in
def test_no_login():
    response = requests.get(auth_url + "/userinfo")
    # should fail
    assert response.status_code == 401
    assert response.headers.get("WWW-Authenticate") is not None
    assert response.headers["WWW-Authenticate"] == "Bearer"


# ---- ---- ---- ----- -----


# Login as FISO (only client credentials step) and call userinfo
def test_only_client_credentials(sts):
    entity_token = sts.get_client(TestEntity.TEST).token

    response = requests.get(
        auth_url + "/userinfo", headers={"Authorization": f"Bearer {entity_token}"}
    )
    # should return partial information
    assert response.status_code == 200
    json = response.json()
    assert json.get("sub") is not None
    assert json.get("entity_id") is not None
    assert not json.get("party_id")
    assert json.get("current_role") is not None
    assert json["current_role"] == "flex_entity"


# ---- ---- ---- ----- -----


# Perform login step 2 (token exchange) and call userinfo again
def test_token_exchange(sts):
    party_token = sts.get_client(TestEntity.TEST, "SP").token

    response = requests.get(
        auth_url + "/userinfo", headers={"Authorization": f"Bearer {party_token}"}
    )
    # should return full record now
    assert response.status_code == 200
    json = response.json()
    assert json.get("sub") is not None
    assert json.get("entity_id") is not None
    assert json.get("party_id") is not None
    assert json.get("current_role") is not None
    assert json["current_role"] != "flex_entity"
