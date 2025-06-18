from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    PartyCreateRequest,
    PartyResponse,
)
from flex.api.party import (
    create_party,
)
import os
import requests
import pytest
import time

"""Test of the token exchange phase of the login process"""


@pytest.fixture
def sts():
    yield SecurityTokenService()


auth_url = os.environ["FLEX_AUTH_BASE"] + "/auth/v0"
auth_headers = {"Content-Type": "application/x-www-form-urlencoded"}

# ---- ---- ---- ----- -----


# Wrong grant type
def test_wrong_grant_type(sts):
    actor_token = sts.get_client(TestEntity.TEST).token
    fiso_id = sts.get_userinfo(sts.get_client(TestEntity.TEST, "FISO"))["party_id"]

    response = requests.post(
        auth_url + "/token",
        headers=auth_headers | {"Authorization": f"Bearer {actor_token}"},
        data={
            "grant_type": "whatever",
            "actor_token": actor_token,
            "actor_token_type": "urn:ietf:params:oauth:token-type:jwt",
            "scope": f"assume:party:{fiso_id}",
        },
    )
    # should fail
    assert response.status_code == 400
    json = response.json()
    assert json.get("error") is not None
    assert json["error"] == "unsupported_grant_type"


# ---- ---- ---- ----- -----


# Wrong actor token
def test_wrong_actor_token(sts):
    fiso_id = sts.get_userinfo(sts.get_client(TestEntity.TEST, "FISO"))["party_id"]

    response = requests.post(
        auth_url + "/token",
        headers=auth_headers | {"Authorization": "Bearer not.a.jwt"},
        data={
            "grant_type": "urn:ietf:params:oauth:grant-type:token-exchange",
            "actor_token": "not.a.jwt",
            "actor_token_type": "urn:ietf:params:oauth:token-type:jwt",
            "scope": f"assume:party:{fiso_id}",
        },
    )
    # should fail
    assert response.status_code == 400
    json = response.json()
    assert json.get("error") is not None
    assert json["error"] == "invalid_request"


# ---- ---- ---- ----- -----


# Wrong actor token type
def test_wrong_actor_token_type(sts):
    actor_token = sts.get_client(TestEntity.TEST).token
    fiso_id = sts.get_userinfo(sts.get_client(TestEntity.TEST, "FISO"))["party_id"]

    response = requests.post(
        auth_url + "/token",
        headers=auth_headers | {"Authorization": f"Bearer {actor_token}"},
        data={
            "grant_type": "urn:ietf:params:oauth:grant-type:token-exchange",
            "actor_token": actor_token,
            "actor_token_type": "whatever",
            "scope": f"assume:party:{fiso_id}",
        },
    )
    # should fail
    assert response.status_code == 400
    json = response.json()
    assert json.get("error") is not None
    assert json["error"] == "invalid_request"


# ---- ---- ---- ----- -----


# Wrong scope format
def test_wrong_scope_format(sts):
    actor_token = sts.get_client(TestEntity.TEST).token

    response = requests.post(
        auth_url + "/token",
        headers=auth_headers | {"Authorization": f"Bearer {actor_token}"},
        data={
            "grant_type": "urn:ietf:params:oauth:grant-type:token-exchange",
            "actor_token": actor_token,
            "actor_token_type": "urn:ietf:params:oauth:token-type:jwt",
            "scope": "whatever",
        },
    )
    # should fail
    assert response.status_code == 400
    json = response.json()
    assert json.get("error") is not None
    assert json["error"] == "invalid_scope"


# ---- ---- ---- ----- -----


# Wrong party ID
def test_wrong_party_id(sts):
    actor_token = sts.get_client(TestEntity.TEST).token

    response = requests.post(
        auth_url + "/token",
        headers=auth_headers | {"Authorization": f"Bearer {actor_token}"},
        data={
            "grant_type": "urn:ietf:params:oauth:grant-type:token-exchange",
            "actor_token": actor_token,
            "actor_token_type": "urn:ietf:params:oauth:token-type:jwt",
            "scope": "assume:party:0",
        },
    )
    # should fail
    assert response.status_code == 400
    json = response.json()
    assert json.get("error") is not None
    assert json["error"] == "invalid_target"


# ---- ---- ---- ----- -----


# Token exchange with the right subject token
def test_token_exchange_ok(sts):
    actor_token = sts.get_client(TestEntity.TEST).token
    fiso_id = sts.get_userinfo(sts.get_client(TestEntity.TEST, "FISO"))["party_id"]

    response = requests.post(
        auth_url + "/token",
        headers=auth_headers | {"Authorization": f"Bearer {actor_token}"},
        data={
            "grant_type": "urn:ietf:params:oauth:grant-type:token-exchange",
            "actor_token": actor_token,
            "actor_token_type": "urn:ietf:params:oauth:token-type:jwt",
            "scope": f"assume:party:{fiso_id}",
        },
    )
    # should succeed
    assert response.status_code == 200
    json = response.json()
    assert json.get("access_token") is not None


# ---- ---- ---- ----- -----


# Token exchange towards owned party (no membership)
def test_token_exchange_ok_ent(sts):
    client_ent = sts.get_client(TestEntity.TEST)
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    ent_id = sts.get_userinfo(client_ent)["entity_id"]

    p = create_party.sync(
        client=client_fiso,
        body=PartyCreateRequest(
            entity_id=ent_id,
            type="end_user",
            role="flex_end_user",
            name="Auth Test EU",
        ),
    )
    assert isinstance(p, PartyResponse)

    actor_token = client_ent.token

    response = requests.post(
        auth_url + "/token",
        headers=auth_headers | {"Authorization": f"Bearer {actor_token}"},
        data={
            "grant_type": "urn:ietf:params:oauth:grant-type:token-exchange",
            "actor_token": actor_token,
            "actor_token_type": "urn:ietf:params:oauth:token-type:jwt",
            "scope": f"assume:party:{p.id}",
        },
    )
    # should succeed
    assert response.status_code == 200
    json = response.json()
    assert json.get("access_token") is not None


# ---- ---- ---- ----- -----


# Token exchange after a few seconds should yield a shorter token
def test_token_exchange_decreasing_remaining_time(sts):
    actor_token = sts.get_client(TestEntity.TEST).token
    fiso_id = sts.get_userinfo(sts.get_client(TestEntity.TEST, "FISO"))["party_id"]

    def get_token_exchange_remaining_time():
        response = requests.post(
            auth_url + "/token",
            headers=auth_headers | {"Authorization": f"Bearer {actor_token}"},
            data={
                "grant_type": "urn:ietf:params:oauth:grant-type:token-exchange",
                "actor_token": actor_token,
                "actor_token_type": "urn:ietf:params:oauth:token-type:jwt",
                "scope": f"assume:party:{fiso_id}",
            },
        )
        return response.json()["expires_in"]

    expires_in1 = get_token_exchange_remaining_time()
    time.sleep(1)
    expires_in2 = get_token_exchange_remaining_time()
    assert expires_in2 < expires_in1
