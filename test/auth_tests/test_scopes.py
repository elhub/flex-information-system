import os
import requests
import pytest
from datetime import datetime as dt, timedelta
from datetime import timezone as tz
import uuid
import jwt

from security_token_service import (
    SecurityTokenService,
    TestEntity,
    AuthenticatedClient,
)
from flex.models import (
    EntityClientCreateRequest,
    EntityClientResponse,
    AuthScope,
    PartyMembershipCreateRequest,
    PartyMembershipResponse,
    PartyCreateRequest,
    PartyBusinessIdType,
    PartyResponse,
    EmptyObject,
)
from flex.api.entity_client import (
    create_entity_client,
    delete_entity_client,
)
from flex.api.party import (
    create_party,
)
from flex.api.party_membership import (
    create_party_membership,
    delete_party_membership,
)
from typing import cast

from api_client_tests.test_party import unique_gln

auth_url = os.environ["FLEX_AUTH_BASE"] + "/auth/v0"
auth_headers = {"Content-Type": "application/x-www-form-urlencoded"}
client_secret = "qwertyuiop123456"


@pytest.fixture(scope="module")
def data(request):
    sts = SecurityTokenService()

    client_fiso = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST, "FISO"))

    client_ent = cast(AuthenticatedClient, sts.get_client(TestEntity.TEST))
    client_other_ent = cast(AuthenticatedClient, sts.get_client(TestEntity.COMMON))

    ent_id = sts.get_userinfo(client_ent)["entity_id"]
    other_ent_id = sts.get_userinfo(client_other_ent)["entity_id"]

    with open("./test/keys/.test.pub.pem") as f:
        pubkey = f.read().strip()
    with open("./test/keys/.test.key.pem") as f:
        privkey = f.read().strip()

    # create an entity client we will log in with
    clt = create_entity_client.sync(
        client=client_ent,
        body=EntityClientCreateRequest(
            entity_id=ent_id,
            name="client - test scopes",
            scopes=[AuthScope.USEDATA, AuthScope.MANAGEAUTH],
            client_secret=client_secret,
            public_key=pubkey,
        ),
    )
    assert isinstance(clt, EntityClientResponse)

    # create party owned by entity
    p1 = create_party.sync(
        client=client_fiso,
        body=PartyCreateRequest(
            name="party - test scopes",
            business_id=unique_gln(),
            business_id_type=PartyBusinessIdType.GLN,
            role="flex_system_operator",
            type="system_operator",
            entity_id=ent_id,
        ),
    )
    assert isinstance(p1, PartyResponse)

    # create party and put entity in it with 2 scopes
    p2 = create_party.sync(
        client=client_fiso,
        body=PartyCreateRequest(
            name="party 2 - test scopes",
            business_id=unique_gln(),
            business_id_type=PartyBusinessIdType.GLN,
            role="flex_system_operator",
            type="system_operator",
            entity_id=other_ent_id,
        ),
    )
    assert isinstance(p2, PartyResponse)

    pm = create_party_membership.sync(
        client=client_fiso,
        body=PartyMembershipCreateRequest(
            entity_id=ent_id,
            party_id=p2.id,
            scopes=[
                AuthScope.MANAGEDATAPARTY_MEMBERSHIP,
                AuthScope.READDATA,
                AuthScope.MANAGEAUTH,
            ],
        ),
    )
    assert isinstance(pm, PartyMembershipResponse)

    def teardown():
        _d = delete_party_membership.sync(
            id=cast(int, pm.id),
            client=client_fiso,
            body=EmptyObject(),
        )
        _d = delete_entity_client.sync(
            id=cast(int, clt.id),
            client=client_ent,
            body=EmptyObject(),
        )

    request.addfinalizer(teardown)

    yield (clt, privkey, p1.id, p1.business_id, p2.id, p2.business_id)


def test_scopes_client_credentials(data):
    entity_clt, _, owned_party_id, _, membership_party_id, _ = data

    entity_clt = cast(EntityClientResponse, entity_clt)

    # log in as entity through entity client secret
    response = requests.post(
        auth_url + "/token",
        headers=auth_headers,
        data={
            "grant_type": "client_credentials",
            "client_id": entity_clt.client_id,
            "client_secret": client_secret,
        },
    )
    assert response.status_code == 200
    json = response.json()
    entity_token = json.get("access_token")
    assert entity_token is not None

    # check scopes come from client
    decoded_token = jwt.decode(
        entity_token,
        algorithms=["HS256"],
        options={"verify_signature": False},
    )
    assert set(decoded_token["scope"].split(" ")) == {"use:data", "manage:auth"}

    # assume owned party
    response = requests.post(
        auth_url + "/token",
        headers=auth_headers | {"Authorization": f"Bearer {entity_token}"},
        data={
            "grant_type": "urn:ietf:params:oauth:grant-type:token-exchange",
            "actor_token": entity_token,
            "actor_token_type": "urn:ietf:params:oauth:token-type:jwt",
            "scope": f"assume:party:{owned_party_id}",
        },
    )
    assert response.status_code == 200
    json = response.json()
    party_token = json.get("access_token")
    assert party_token is not None

    # check scopes are still client scopes
    # (owned party = no extra scopes to take into account)
    decoded_token = jwt.decode(
        party_token,
        algorithms=["HS256"],
        options={"verify_signature": False},
    )
    assert set(decoded_token["scope"].split(" ")) == {"use:data", "manage:auth"}

    # unassume party
    response = requests.delete(
        auth_url + "/assume",
        headers=auth_headers | {"Authorization": f"Bearer {party_token}"},
        cookies={"__Host-flex_session": party_token},
    )
    assert response.status_code == 200
    entity_token = response.cookies.get("__Host-flex_session")
    assert entity_token is not None

    # check scopes are reset to the client scopes
    decoded_token = jwt.decode(
        entity_token,
        algorithms=["HS256"],
        options={"verify_signature": False},
    )
    assert set(decoded_token["scope"].split(" ")) == {"use:data", "manage:auth"}

    # assume party via membership
    response = requests.post(
        auth_url + "/token",
        headers=auth_headers | {"Authorization": f"Bearer {entity_token}"},
        data={
            "grant_type": "urn:ietf:params:oauth:grant-type:token-exchange",
            "actor_token": entity_token,
            "actor_token_type": "urn:ietf:params:oauth:token-type:jwt",
            "scope": f"assume:party:{membership_party_id}",
        },
    )
    assert response.status_code == 200
    json = response.json()
    party_token = json.get("access_token")
    assert party_token is not None

    # check scopes = client scopes X party membership scopes
    decoded_token = jwt.decode(
        party_token,
        algorithms=["HS256"],
        options={"verify_signature": False},
    )
    assert set(decoded_token["scope"].split(" ")) == {
        "read:data",
        "use:data:party_membership",
        "manage:auth",
    }


def test_scopes_jwt_bearer_entity(data):
    entity_clt, clt_private_key, owned_party_id, _, membership_party_id, _ = data

    # log in as entity through entity client key
    payload = {
        "aud": "https://test.flex.internal:6443/auth/v0/",
        "iss": entity_clt.client_id,
        "jti": str(uuid.uuid4()),
        "iat": dt.now(tz.utc),
        "exp": dt.now(tz.utc) + timedelta(seconds=120),
    }
    token = jwt.encode(payload, clt_private_key, algorithm="RS256")

    response = requests.post(
        auth_url + "/token",
        headers=auth_headers,
        data={
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": token,
        },
    )
    assert response.status_code == 200
    json = response.json()
    entity_token = json.get("access_token")
    assert entity_token is not None

    # check scopes come from client
    decoded_token = jwt.decode(
        entity_token,
        algorithms=["HS256"],
        options={"verify_signature": False},
    )
    assert set(decoded_token["scope"].split(" ")) == {"use:data", "manage:auth"}

    # assume owned party
    response = requests.post(
        auth_url + "/token",
        headers=auth_headers | {"Authorization": f"Bearer {entity_token}"},
        data={
            "grant_type": "urn:ietf:params:oauth:grant-type:token-exchange",
            "actor_token": entity_token,
            "actor_token_type": "urn:ietf:params:oauth:token-type:jwt",
            "scope": f"assume:party:{owned_party_id}",
        },
    )
    assert response.status_code == 200
    json = response.json()
    party_token = json.get("access_token")
    assert party_token is not None

    # check scopes are still client scopes
    # (owned party = no extra scopes to take into account)
    decoded_token = jwt.decode(
        party_token,
        algorithms=["HS256"],
        options={"verify_signature": False},
    )
    assert set(decoded_token["scope"].split(" ")) == {"use:data", "manage:auth"}

    # unassume party
    response = requests.delete(
        auth_url + "/assume",
        headers=auth_headers | {"Authorization": f"Bearer {party_token}"},
        cookies={"__Host-flex_session": party_token},
    )
    assert response.status_code == 200
    entity_token = response.cookies.get("__Host-flex_session")
    assert entity_token is not None

    # check scopes are reset to the client scopes
    decoded_token = jwt.decode(
        entity_token,
        algorithms=["HS256"],
        options={"verify_signature": False},
    )
    assert set(decoded_token["scope"].split(" ")) == {"use:data", "manage:auth"}

    # assume party via membership
    response = requests.post(
        auth_url + "/token",
        headers=auth_headers | {"Authorization": f"Bearer {entity_token}"},
        data={
            "grant_type": "urn:ietf:params:oauth:grant-type:token-exchange",
            "actor_token": entity_token,
            "actor_token_type": "urn:ietf:params:oauth:token-type:jwt",
            "scope": f"assume:party:{membership_party_id}",
        },
    )
    assert response.status_code == 200
    json = response.json()
    party_token = json.get("access_token")
    assert party_token is not None

    # check scopes = client scopes X party membership scopes
    decoded_token = jwt.decode(
        party_token,
        algorithms=["HS256"],
        options={"verify_signature": False},
    )
    assert set(decoded_token["scope"].split(" ")) == {
        "read:data",
        "use:data:party_membership",
        "manage:auth",
    }


def test_scopes_jwt_bearer_owned_party(data):
    entity_clt, clt_private_key, _, owned_party_gln, _, _ = data

    # log in as owned party through entity client key
    payload = {
        "aud": "https://test.flex.internal:6443/auth/v0/",
        "iss": entity_clt.client_id,
        "jti": str(uuid.uuid4()),
        "iat": dt.now(tz.utc),
        "exp": dt.now(tz.utc) + timedelta(seconds=120),
        "sub": f"no:party:gln:{owned_party_gln}",
    }
    token = jwt.encode(payload, clt_private_key, algorithm="RS256")

    response = requests.post(
        auth_url + "/token",
        headers=auth_headers,
        data={
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": token,
        },
    )
    assert response.status_code == 200
    json = response.json()
    party_token = json.get("access_token")
    assert party_token is not None

    # check scopes = client scopes
    decoded_token = jwt.decode(
        party_token,
        algorithms=["HS256"],
        options={"verify_signature": False},
    )
    assert set(decoded_token["scope"].split(" ")) == {"use:data", "manage:auth"}


def test_scopes_jwt_bearer_membership_party(data):
    entity_clt, clt_private_key, _, _, _, membership_party_gln = data

    # log in as owned party through entity client key
    payload = {
        "aud": "https://test.flex.internal:6443/auth/v0/",
        "iss": entity_clt.client_id,
        "jti": str(uuid.uuid4()),
        "iat": dt.now(tz.utc),
        "exp": dt.now(tz.utc) + timedelta(seconds=120),
        "sub": f"no:party:gln:{membership_party_gln}",
    }
    token = jwt.encode(payload, clt_private_key, algorithm="RS256")

    response = requests.post(
        auth_url + "/token",
        headers=auth_headers,
        data={
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": token,
        },
    )
    assert response.status_code == 200
    json = response.json()
    party_token = json.get("access_token")
    assert party_token is not None

    # check scopes = client scopes X party membership scopes
    decoded_token = jwt.decode(
        party_token,
        algorithms=["HS256"],
        options={"verify_signature": False},
    )
    assert set(decoded_token["scope"].split(" ")) == {
        "read:data",
        "use:data:party_membership",
        "manage:auth",
    }
