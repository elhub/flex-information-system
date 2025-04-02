import os
import requests
from typing import Union, cast
from time import sleep

"""Test of the client credentials phase of the login process"""

auth_url = os.environ["FLEX_AUTH_BASE"] + "/auth/v0"
auth_headers = {"Content-Type": "application/x-www-form-urlencoded"}

# ---- ---- ---- ----- -----


# Try to log in with wrong grant type
def test_wrong_grant_type():
    response = requests.post(
        auth_url + "/token",
        headers=auth_headers,
        data={
            "grant_type": "bad_grant_type",
            "client_id": "whatever",
            "client_secret": "whatever",
        },
    )
    # should fail
    assert response.status_code == 400
    json = response.json()
    assert json.get("error") is not None
    assert json["error"] == "unsupported_grant_type"


# ---- ---- ---- ----- -----


# Try to log in as an unknown client
def test_unknown_client():
    response = requests.post(
        auth_url + "/token",
        headers=auth_headers,
        data={
            "grant_type": "client_credentials",
            "client_id": "unknown_client",
            "client_secret": "whatever",
        },
    )
    # should fail
    assert response.status_code == 400
    json = response.json()
    assert json.get("error") is not None
    assert json["error"] == "invalid_client"


# ---- ---- ---- ----- -----


# Try to log in as a known client with the wrong password
def test_wrong_password():
    response = requests.post(
        auth_url + "/token",
        headers=auth_headers,
        data={
            "grant_type": "client_credentials",
            "client_id": "3733e21b-5def-400d-8133-06bcda02465e",
            "client_secret": "wrong_pass",
        },
    )
    # should fail
    assert response.status_code == 400
    json = response.json()
    assert json.get("error") is not None
    assert json["error"] == "invalid_client"


# ---- ---- ---- ----- -----


# Try to log in as a known client with the right password
def test_client_credentials_ok():
    response = requests.post(
        auth_url + "/token",
        headers=auth_headers,
        data={
            "grant_type": "client_credentials",
            "client_id": "3733e21b-5def-400d-8133-06bcda02465e",
            "client_secret": "87h87hijhulO",
        },
    )
    # should succeed
    assert response.status_code == 200
    json = response.json()
    assert json.get("access_token") is not None


# ---- ---- ---- ----- -----


# Try to spam the system with wrong credentials
def test_spam():
    response: Union[requests.Response, None] = None
    for _ in range(20):
        response = requests.post(
            auth_url + "/token",
            headers=auth_headers,
            data={
                "grant_type": "client_credentials",
                "client_id": "3733e21b-5def-400d-8133-06bcda02465e",
                "client_secret": "wrong_pass",
            },
        )

    # the last response should be a Too Many Requests
    assert cast(requests.Response, response).status_code == 429
    json = cast(requests.Response, response).json()
    assert json.get("error") is not None
    assert json["error"] == "access_denied"

    sleep(4)

    # now the window is over and we can try again

    response = requests.post(
        auth_url + "/token",
        headers=auth_headers,
        data={
            "grant_type": "client_credentials",
            "client_id": "3733e21b-5def-400d-8133-06bcda02465e",
            "client_secret": "wrong_pass",
        },
    )

    assert cast(requests.Response, response).status_code == 400
    json = cast(requests.Response, response).json()
    assert json.get("error") is not None
    assert json["error"] == "invalid_client"
