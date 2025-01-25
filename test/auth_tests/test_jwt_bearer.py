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


@pytest.mark.parametrize(
    "key,pid,expected_status,error",
    [
        ("test", "13370000001", 200, ""),
        ("common", "13370000000", 200, ""),
        ("common", "malformed", 400, "invalid_request"),
        ("common", "13370000013", 400, "invalid_client"),  # Existing entity
        ("common", "44440000000", 400, "invalid_client"),  # Non-existing entity
        ("common", "13370000001", 400, "invalid_request"),
    ],
)
def test_entity(keys, key, pid, expected_status, error):
    payload = {
        # Audience
        "aud": "https://flex.localhost:6443/auth/v0/",
        # Issuer
        "iss": f"no:entity:pid:{pid}",  # Test Suite
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
    "key,pid,gln,expected_status,error",
    [
        ("test", "13370000001", "1337000100058", 200, ""),  # Test ENT - Test SP
        ("common", "13370000000", "1337000000051", 200, ""),  # Common ENT - Common SP
        (
            "common",
            "13370000000",
            "1337000100058",
            400,
            "invalid_client",
        ),  # Common ENT - Test SP
        (
            "test",
            "13370000002",
            "1337121312322",
            400,
            "invalid_client",
        ),  # Test ENT - unknown GLN
        (
            "common",
            "13370000002",
            "malformed",
            400,
            "invalid_request",
        ),  # Does entity does not exist
    ],
)
def test_party(keys, key, pid, gln, expected_status, error):
    payload = {
        # Audience
        "aud": "https://flex.localhost:6443/auth/v0/",
        # Issuer
        "iss": f"no:entity:pid:{pid}",  # Test Suite
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
            "https://flex.localhost:6443/auth/v0/",
            "no:entity:pid:13370000001",
            "no:party:gln:1337000100058",
            200,
        ),
        # Invalid audience
        (
            "https://flex.localhost:6443/auth/v0",
            "no:entity:pid:13370000001",
            "no:party:gln:1337000100058",
            400,
        ),
        (
            "https://flex.localost:6443/auth/v0/",
            "no:entity:pid:13370000001",
            "no:party:gln:1337000100058",
            400,
        ),
        # Invalid issuer
        (
            "https://flex.localhost:6443/auth/v0/",
            "no:entity:13370000001",
            "no:party:gln:1337000100058",
            400,
        ),
        (
            "https://flex.localhost:6443/auth/v0/",
            "no:party:pid:13370000001",
            "no:party:gln:1337000100058",
            400,
        ),
        # Invalid subject
        (
            "https://flex.localhost:6443/auth/v0/",
            "no:entity:pid:13370000001",
            "no:entity:gln:1337000100058",
            400,
        ),
        (
            "https://flex.localhost:6443/auth/v0/",
            "no:entity:pid:13370000001",
            "party:gln:1337000100058",
            400,
        ),
        (
            "https://flex.localhost:6443/auth/v0/",
            "no:entity:pid:13370000001",
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
        "aud": "https://flex.localhost:6443/auth/v0/",
        # Issuer
        "iss": "no:entity:pid:13370000001",  # Test Suite
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
