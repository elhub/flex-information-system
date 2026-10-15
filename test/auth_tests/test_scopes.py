import os
import requests
import pytest
from datetime import datetime as dt, timedelta
from datetime import timezone as tz
import uuid
import jwt

from security_token_service import (
    SecurityTokenService,
    TestEntityClient,
    AuthenticatedClient,
    API_VERSION,
)
from flex.models import (
    AuthScope,
    PartyMembershipCreateRequest,
    PartyMembershipResponse,
    PartyCreateRequest,
    PartyRole,
    PartyType,
    PartyBusinessIdType,
    PartyResponse,
    EmptyObject,
)
from flex.api.party import (
    create_party,
)
from flex.api.party_membership import (
    create_party_membership,
    delete_party_membership,
    list_party_membership,
)
from typing import cast

from api_client_tests.test_party import unique_gln

auth_url = os.environ["FLEX_AUTH_BASE"] + "/auth/v1"
grid_url = os.environ["FLEX_URL_BASE"] + "/grid/v0"
auth_headers = {"Content-Type": "application/x-www-form-urlencoded"}


def jwt_bearer_token(client_id, privkey, sub=None):
    """
    Log in as an entity client through the JWT bearer grant.
    Without sub the token is an entity token, with sub it is a party token.
    """
    now = dt.now(tz.utc)
    claims = {
        "aud": auth_url + "/",
        "iss": client_id,
        "jti": str(uuid.uuid4()),
        "iat": now,
        "exp": now + timedelta(seconds=120),
    }
    if sub is not None:
        claims["sub"] = sub
    grant = jwt.encode(claims, privkey, algorithm="RS256")
    response = requests.post(
        auth_url + "/token",
        headers=auth_headers,
        data={
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": grant,
        },
    )
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.fixture(scope="module")
def jwt_keys():
    with open("./test/keys/.test.pub.pem") as f:
        pubkey = f.read().strip()
    with open("./test/keys/.test.key.pem") as f:
        privkey = f.read().strip()
    return pubkey, privkey


@pytest.fixture(scope="module")
def data(request, jwt_keys):
    sts = SecurityTokenService()

    client_fiso = cast(
        AuthenticatedClient, sts.get_client(TestEntityClient.TEST, "FISO")
    )

    client_ent = cast(AuthenticatedClient, sts.get_client(TestEntityClient.TEST))
    client_other_ent = cast(
        AuthenticatedClient, sts.get_client(TestEntityClient.COMMON)
    )

    ent_id = sts.get_userinfo(client_ent)["entity_id"]
    other_ent_id = sts.get_userinfo(client_other_ent)["entity_id"]

    _, privkey = jwt_keys

    # entity client we will log in with (use:data, manage:auth)
    # seeded in the test data, since machines cannot create entity clients
    clt = TestEntityClient.TEST_SCOPES

    # create party owned by entity
    p1 = create_party.sync(
        client=client_fiso,
        body=PartyCreateRequest(
            name="party - test scopes",
            business_id=unique_gln(),
            business_id_type=PartyBusinessIdType.GLN,
            role=PartyRole.FLEX_SYSTEM_OPERATOR,
            type_=PartyType.SYSTEM_OPERATOR,
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
            role=PartyRole.FLEX_SYSTEM_OPERATOR,
            type_=PartyType.SYSTEM_OPERATOR,
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

    request.addfinalizer(teardown)

    yield (clt.client_id(), privkey, p1.id, p1.business_id, p2.id, p2.business_id)


def test_scopes_entity_token_exchange(data):
    entity_clt_id, clt_private_key, owned_party_id, _, membership_party_id, _ = data

    # log in as entity through entity client key
    entity_token = jwt_bearer_token(entity_clt_id, clt_private_key)

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

    # try to unassume party
    response = requests.delete(
        auth_url + "/assume",
        headers=auth_headers | {"Authorization": f"Bearer {party_token}"},
        cookies={"__Host-flex_session": party_token},
    )
    # entity clients are not allowed to unassume, they have to log in again
    assert response.status_code == 400
    entity_token = jwt_bearer_token(entity_clt_id, clt_private_key)

    # check scopes are the client scopes
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
    entity_clt_id, clt_private_key, owned_party_id, _, membership_party_id, _ = data

    # log in as entity through entity client key
    payload = {
        "aud": "https://test.flex.internal:6443/auth/v1/",
        "iss": entity_clt_id,
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

    # try to unassume party
    response = requests.delete(
        auth_url + "/assume",
        headers=auth_headers | {"Authorization": f"Bearer {party_token}"},
        cookies={"__Host-flex_session": party_token},
    )
    # entity clients are not allowed to unassume, they have to log in again
    assert response.status_code == 400
    entity_token = jwt_bearer_token(entity_clt_id, clt_private_key)

    # check scopes are the client scopes
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
    entity_clt_id, clt_private_key, _, owned_party_gln, _, _ = data

    # log in as owned party through entity client key
    payload = {
        "aud": "https://test.flex.internal:6443/auth/v1/",
        "iss": entity_clt_id,
        "jti": str(uuid.uuid4()),
        "iat": dt.now(tz.utc),
        "exp": dt.now(tz.utc) + timedelta(seconds=120),
        "sub": f"no:party:gln:{owned_party_gln}:system_operator",
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
    entity_clt_id, clt_private_key, _, _, _, membership_party_gln = data

    # log in as owned party through entity client key
    payload = {
        "aud": "https://test.flex.internal:6443/auth/v1/",
        "iss": entity_clt_id,
        "jti": str(uuid.uuid4()),
        "iat": dt.now(tz.utc),
        "exp": dt.now(tz.utc) + timedelta(seconds=120),
        "sub": f"no:party:gln:{membership_party_gln}:system_operator",
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


def test_scopes_embedding(jwt_keys):
    # this test checks that an entity client lacking sufficient scopes cannot
    # embed resources in a query

    sts = SecurityTokenService()

    client_ent = cast(AuthenticatedClient, sts.get_client(TestEntityClient.TEST))
    client_fiso = cast(
        AuthenticatedClient, sts.get_client(TestEntityClient.TEST, "FISO")
    )

    ent_id = sts.get_userinfo(client_ent)["entity_id"]

    _, privkey = jwt_keys

    # seeded entity client that can only manage party membership but not read
    # other resources (manage:data:party_membership, manage:auth)
    client_id = TestEntityClient.TEST_PARTY_MEMBERSHIP_ONLY.client_id()

    # create an owned party so we can assume it and keep the client scopes
    party = create_party.sync(
        client=client_fiso,
        body=PartyCreateRequest(
            name="party - test embed scopes",
            business_id=unique_gln(),
            business_id_type=PartyBusinessIdType.GLN,
            role=PartyRole.FLEX_SYSTEM_OPERATOR,
            type_=PartyType.SYSTEM_OPERATOR,
            entity_id=ent_id,
        ),
    )
    assert isinstance(party, PartyResponse)

    # log in as owned party through entity client key
    payload = {
        "aud": "https://test.flex.internal:6443/auth/v1/",
        "iss": client_id,
        "jti": str(uuid.uuid4()),
        "iat": dt.now(tz.utc),
        "exp": dt.now(tz.utc) + timedelta(seconds=120),
        "sub": f"no:party:gln:{party.business_id}:system_operator",
    }
    token = jwt.encode(payload, privkey, algorithm="RS256")

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

    # create our API client with these narrow scopes
    test_client = AuthenticatedClient(
        base_url=SecurityTokenService.api_url,
        token=party_token,
        verify_ssl=False,
        headers={"Api-Version": API_VERSION},
    )

    # embed request fails because client cannot read party
    e = list_party_membership.sync_detailed(
        client=test_client,
        limit="10",
        embed="party",
    )
    assert e.status_code == 403


def test_scopes_grid_read_grid_required(jwt_keys):
    _, privkey = jwt_keys
    sts = SecurityTokenService()
    client_ent = cast(AuthenticatedClient, sts.get_client(TestEntityClient.TEST))

    client_fiso = cast(
        AuthenticatedClient, sts.get_client(TestEntityClient.TEST, "FISO")
    )

    ent_id = sts.get_userinfo(client_ent)["entity_id"]

    other_ent_id = sts.get_userinfo(
        cast(AuthenticatedClient, sts.get_client(TestEntityClient.COMMON))
    )["entity_id"]

    # SO party owned by another entity, with the entity as a member.
    # Owned parties do not get read:grid, so it must come from the membership.
    party = create_party.sync(
        client=client_fiso,
        body=PartyCreateRequest(
            name="party - test grid scopes",
            business_id=unique_gln(),
            business_id_type=PartyBusinessIdType.GLN,
            role=PartyRole.FLEX_SYSTEM_OPERATOR,
            type_=PartyType.SYSTEM_OPERATOR,
            entity_id=other_ent_id,
        ),
    )
    assert isinstance(party, PartyResponse)
    pm = create_party_membership.sync(
        client=client_fiso,
        body=PartyMembershipCreateRequest(
            entity_id=ent_id,
            party_id=cast(int, party.id),
            scopes=[AuthScope.READGRID, AuthScope.READDATA, AuthScope.MANAGEAUTH],
        ),
    )
    assert isinstance(pm, PartyMembershipResponse)
    sub = f"no:party:gln:{party.business_id}:system_operator"

    # seeded client with read:grid (read:grid, manage:auth)
    token_with_grid = jwt_bearer_token(
        TestEntityClient.TEST_GRID.client_id(), privkey, sub
    )

    # can read grid
    r = requests.get(
        grid_url + "/substation",
        headers={"Authorization": f"Bearer {token_with_grid}"},
        verify=False,
    )
    assert r.status_code == 200

    # seeded client with only read:data (read:data, manage:auth)
    token_data_only = jwt_bearer_token(
        TestEntityClient.TEST_DATA_ONLY.client_id(), privkey, sub
    )

    # cannot read grid
    r = requests.get(
        grid_url + "/substation",
        headers={"Authorization": f"Bearer {token_data_only}"},
        verify=False,
    )
    assert r.status_code == 403

    # cleanup
    delete_party_membership.sync(
        id=cast(int, pm.id),
        client=client_fiso,
        body=EmptyObject(),
    )
