import schemathesis
import os
from dotenv import load_dotenv
from typing import Protocol

from security_token_service import (
    SecurityTokenService,
    TestEntity,
    AuthenticatedClient,
)

"""
This test launches schemathesis on the API to check that error codes and format
are consistent with the documented error cases in the OpenAPI specification.
"""

load_dotenv()

# login to get access to the OpenAPI file
client = SecurityTokenService().get_client(TestEntity.TEST, "FISO")
assert isinstance(client, AuthenticatedClient)
token = client.token

# We are reading the file from local instead of the URL to be able to
# iterate faster on the OpenAPI file while developing
openapi_document = open("backend/data/static/openapi.json", "r").read()


# Filter function to allow us to precisely pick out relevant checks.
class HasAPIOperation(Protocol):
    operation: schemathesis.APIOperation


# Include func to filter only relevant operations
def include_func(call: HasAPIOperation) -> bool:
    return call.operation.path.startswith(
        "/openapi.json"
    ) or call.operation.path.startswith("/controllable_unit")


schema = schemathesis.openapi.from_file(openapi_document).include(func=include_func)


@schema.parametrize()
def test_schemathesis(case: schemathesis.Case) -> None:
    api_url = os.environ["FLEX_URL_BASE"] + "/api/v0"
    response = case.call(base_url=api_url, headers={"Authorization": f"Bearer {token}"})

    # When the OpenAPI spec includes a cookie securityScheme, then we get some 500s
    case.validate_response(response)
