import requests
import os
from typing import cast
from flex import AuthenticatedClient
from security_token_service import (
    SecurityTokenService,
    TestEntity,
)


def test_openapi():
    api_url = os.environ["FLEX_URL_BASE"] + "/api/v1"

    entity_token = cast(
        AuthenticatedClient, SecurityTokenService().get_client(TestEntity.TEST)
    ).token

    # endpoint: GET /openapi.json
    response = requests.get(
        api_url + "/openapi.json", headers={"Authorization": f"Bearer {entity_token}"}
    )
    response.raise_for_status()
