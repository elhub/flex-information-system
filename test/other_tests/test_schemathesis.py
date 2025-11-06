import schemathesis
from schemathesis.checks import not_a_server_error
import os
from dotenv import load_dotenv

from security_token_service import (
    SecurityTokenService,
    TestEntity,
)

"""
This test launches schemathesis on the API to check that error codes and format
are consistent with the documented error cases in the OpenAPI specification.
"""

load_dotenv()

# login to get access to the OpenAPI file
token = SecurityTokenService().get_client(TestEntity.TEST, "FISO").token

# We are reading the file from local instead of the URL to be able to
# iterate faster on the OpenAPI file while developing
openapi_document = open("backend/data/static/openapi.json", "r").read()

api_url = os.environ["FLEX_URL_BASE"] + "/api/v0"

schema = schemathesis.openapi.from_file(
    openapi_document
)


@schema.parametrize()
def test_schemathesis(case):
    response = case.call(headers={"Authorization": f"Bearer {token}"})

    # When the OpenAPI spec includes a cookie securityScheme, then we get some 500s
    case.validate_response(response, excluded_checks=(not_a_server_error,))
