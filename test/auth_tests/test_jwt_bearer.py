import os
import requests
import pytest
from datetime import datetime as dt, timedelta
from datetime import timezone as tz
import uuid
import jwt


@pytest.fixture
def keys():
    keys = {}
    with open("./test/keys/.test.key.pem") as f:
        keys["test"] = f.read()
    with open("./test/keys/.common.key.pem") as f:
        keys["common"] = f.read()
    return keys


auth_request_headers = {"Content-Type": "application/x-www-form-urlencoded"}
auth_url = os.environ["FLEX_AUTH_BASE"] + "/auth/v0"
grant_type_bearer = "urn:ietf:params:oauth:grant-type:jwt-bearer"

client_ids = {
    "test": "3733e21b-5def-400d-8133-06bcda02465e",
    "common": "df8bee5f-6e60-4a21-8927-e5bcdd4ce768",
}


@pytest.mark.parametrize(
    "key,pid,client_id,expected_status,error",
    [
        ("test", "13370000001", client_ids["test"], 200, ""),
        ("common", "13370000000", client_ids["common"], 200, ""),
        ("common", "malformed", client_ids["common"], 400, "invalid_request"),
        ("common", "13370000000", "malformed", 400, "invalid_request"),
        ("common", "13370000000", None, 400, "invalid_request"),
        (
            "common",
            "13370000013",
            client_ids["common"],
            400,
            "invalid_client",
        ),  # Existing entity
        (
            "common",
            "44440000000",
            client_ids["common"],
            400,
            "invalid_client",
        ),  # Non-existing entity
        ("common", "13370000001", client_ids["common"], 400, "invalid_client"),
        ("test", "13370000000", client_ids["test"], 400, "invalid_client"),
    ],
)
def test_entity(keys, key, pid, client_id, expected_status, error):
    iss = f"no:entity:pid:{pid}" + (":" + client_id) if client_id is not None else ""
    payload = {
        # Audience
        "aud": "https://test.flex.internal:6443/auth/v0/",
        # Issuer
        "iss": iss,  # Test Suite
        # JWT ID
        "jti": str(uuid.uuid4()),
        # Issued at
        "iat": dt.now(tz.utc),
        # Expiration time
        "exp": dt.now(tz.utc) + timedelta(seconds=120),  # Token expires in 30 seconds
    }

    token = jwt.encode(payload, keys[key], algorithm="RS256")

    response = requests.post(
        auth_url + "/token",
        headers=auth_request_headers,
        data={
            "grant_type": grant_type_bearer,
            "assertion": token,
        },
    )
    assert response.status_code == expected_status
    if response.status_code == 400:
        assert error == response.json()["error"]


@pytest.mark.parametrize(
    "key,pid,gln,client_id,expected_status,error",
    [
        (
            "test",
            "13370000001",
            "1337000100058",
            client_ids["test"],
            200,
            "",
        ),  # Test ENT - Test SP
        (
            "common",
            "13370000000",
            "1337000000051",
            client_ids["common"],
            200,
            "",
        ),  # Common ENT - Common SP
        (
            "common",
            "13370000000",
            "1337000100058",
            client_ids["common"],
            400,
            "invalid_client",
        ),  # Common ENT - Test SP
        (
            "test",
            "13370000002",
            "1337121312322",
            client_ids["test"],
            400,
            "invalid_client",
        ),  # Test ENT - unknown GLN
        (
            "common",
            "13370000002",
            "malformed",
            client_ids["common"],
            400,
            "invalid_request",
        ),  # Does entity does not exist
    ],
)
def test_party(keys, key, pid, gln, client_id, expected_status, error):
    iss = f"no:entity:pid:{pid}" + (":" + client_id) if client_id is not None else ""
    payload = {
        # Audience
        "aud": "https://test.flex.internal:6443/auth/v0/",
        # Issuer
        "iss": iss,  # Test Suite
        # JWT ID
        "jti": str(uuid.uuid4()),
        # Subject (the subject to get a token for)
        "sub": f"no:party:gln:{gln}",
        # Issued at
        "iat": dt.now(tz.utc),
        # Expiration time
        "exp": dt.now(tz.utc) + timedelta(seconds=120),  # Token expires in 30 seconds
    }

    token = jwt.encode(payload, keys[key], algorithm="RS256")

    response = requests.post(
        auth_url + "/token",
        headers=auth_request_headers,
        data={
            "grant_type": grant_type_bearer,
            "assertion": token,
        },
    )
    assert response.status_code == expected_status
    if response.status_code == 400:
        assert error == response.json()["error"]


@pytest.mark.parametrize(  # fmt: skip
    "aud, iss, sub, expected_status",
    [
        # The only valid case
        (
            "https://test.flex.internal:6443/auth/v0/",
            f"no:entity:pid:13370000001:{client_ids['test']}",
            "no:party:gln:1337000100058",
            200,
        ),
        # Invalid audience
        (
            "https://test.flex.internal:6443/auth/v0",
            f"no:entity:pid:13370000001:{client_ids['test']}",
            "no:party:gln:1337000100058",
            400,
        ),
        (
            "https://flex.localost:6443/auth/v0/",
            f"no:entity:pid:13370000001:{client_ids['test']}",
            "no:party:gln:1337000100058",
            400,
        ),
        # Invalid issuer
        (
            "https://test.flex.internal:6443/auth/v0/",
            f"no:entity:13370000001:{client_ids['test']}",
            "no:party:gln:1337000100058",
            400,
        ),
        (
            "https://test.flex.internal:6443/auth/v0/",
            "no:entity:pid:13370000001",
            "no:party:gln:1337000100058",
            400,
        ),
        (
            "https://test.flex.internal:6443/auth/v0/",
            f"no:party:pid:13370000001:{client_ids['test']}",
            "no:party:gln:1337000100058",
            400,
        ),
        # Invalid subject
        (
            "https://test.flex.internal:6443/auth/v0/",
            f"no:entity:pid:13370000001:{client_ids['test']}",
            "no:entity:gln:1337000100058",
            400,
        ),
        (
            "https://test.flex.internal:6443/auth/v0/",
            f"no:entity:pid:13370000001:{client_ids['test']}",
            "party:gln:1337000100058",
            400,
        ),
        (
            "https://test.flex.internal:6443/auth/v0/",
            f"no:entity:pid:13370000001:{client_ids['test']}",
            "no:party:gln:337000100058",
            400,
        ),
    ],
)
def test_malformed(keys, aud, iss, sub, expected_status):
    payload = {
        # Audience
        "aud": aud,
        # Issuer
        "iss": iss,  # Test Suite
        # Subject
        "sub": sub,
        # JWT ID
        "jti": str(uuid.uuid4()),
        # Issued at
        "iat": dt.now(tz.utc),
        # Expiration time
        "exp": dt.now(tz.utc) + timedelta(seconds=120),  # Token expires in 30 seconds
    }

    token = jwt.encode(payload, keys["test"], algorithm="RS256")

    response = requests.post(
        auth_url + "/token",
        headers=auth_request_headers,
        data={
            "grant_type": grant_type_bearer,
            "assertion": token,
        },
    )
    assert response.status_code == expected_status
    if expected_status == 400:
        assert response.json()["error"] == "invalid_request"


@pytest.mark.parametrize(
    "expected_status, iat, exp",
    [
        # The only valid case
        (200, dt.now(tz.utc), dt.now(tz.utc) + timedelta(seconds=120)),
        # Token expired
        (
            400,
            dt.now(tz.utc) - timedelta(seconds=240),
            dt.now(tz.utc) - timedelta(seconds=120),
        ),
        # Token not yet valid
        (
            400,
            dt.now(tz.utc) + timedelta(seconds=240),
            dt.now(tz.utc) + timedelta(seconds=120),
        ),
        # Lifetime of token is 0
        (400, dt.now(tz.utc), dt.now(tz.utc)),
        # Lifetime of token is more than 120 seconds
        (400, dt.now(tz.utc), dt.now(tz.utc) + timedelta(seconds=240)),
    ],
)
def test_timing(keys, expected_status, iat, exp):
    payload = {
        # Audience
        "aud": "https://test.flex.internal:6443/auth/v0/",
        # Issuer
        "iss": f"no:entity:pid:13370000001:{client_ids['test']}",  # Test Suite
        # Subject
        "sub": "no:party:gln:1337000100058",
        # JWT ID
        "jti": str(uuid.uuid4()),
        # Issued at
        "iat": iat,
        # Expiration time
        "exp": exp,  # Token expires in 30 seconds
    }

    token = jwt.encode(payload, keys["test"], algorithm="RS256")

    response = requests.post(
        auth_url + "/token",
        headers=auth_request_headers,
        data={
            "grant_type": grant_type_bearer,
            "assertion": token,
        },
    )
    assert response.status_code == expected_status
    if expected_status != 200:
        assert response.json()["error"] == "invalid_request"
