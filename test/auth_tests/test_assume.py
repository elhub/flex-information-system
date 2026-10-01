import os
import requests
import pytest

from security_token_service import (
    SecurityTokenService,
    TestEntityClient,
)

"""Test of the POST /assume endpoint"""


@pytest.fixture
def sts():
    yield SecurityTokenService()


auth_url = os.environ["FLEX_AUTH_BASE"] + "/auth/v1"
auth_headers = {"Content-Type": "application/x-www-form-urlencoded"}

# ---- ---- ---- ----- -----


# A client cannot use the browser assume endpoint, only persons can
def test_assume_endpoint_rejects_clients(sts):
    entity_token = sts.get_client(TestEntityClient.TEST).token
    fiso_id = sts.get_userinfo(sts.get_client(TestEntityClient.TEST, "FISO"))[
        "party_id"
    ]

    response = requests.post(
        auth_url + "/assume",
        headers=auth_headers,
        cookies={"__Host-flex_session": entity_token},
        data={"party_id": fiso_id},
    )
    assert response.status_code == 400
    json = response.json()
    assert json.get("error") is not None
    assert json["error"] == "invalid_client"
