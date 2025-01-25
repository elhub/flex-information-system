import jwt
from security_token_service import (
    SecurityTokenService,
    TestEntity,
)

"""Check that the JWT tokens are signed with a recent enough algorithm"""


def test_token_alg():
    sts = SecurityTokenService()

    entity_token = sts.get_client(TestEntity.TEST).token
    party_token = sts.get_client(TestEntity.TEST, "SP").token

    for token in [entity_token, party_token]:
        unverified_header = jwt.get_unverified_header(token)

        # We should be using minimum 384 bits on SHA
        alg = unverified_header["alg"].upper()
        assert alg in ["HS384", "HS512"]
