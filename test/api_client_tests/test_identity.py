from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import Identity, ErrorMessage
from flex.api.identity import (
    list_identity,
    read_identity,
)
from typing import cast

import pytest


@pytest.fixture
def sts():
    yield SecurityTokenService()


# RLS: ID-ENT001
# RLS: ID-COM001
def test_identity(sts):
    client_ent = sts.get_client(TestEntity.TEST)

    # generate clients before listing identities
    # (the first generation of a client creates a new identity, so this loop
    # iteration modifies the state of the very thing we test here)
    clients = [sts.get_client(TestEntity.TEST, role) for role in sts.COMMON_ROLES]

    ids = list_identity.sync(client=client_ent)
    assert isinstance(ids, list)
    nb_identities = len(ids)
    assert nb_identities > 0

    for client in clients:
        # endpoint: GET /identity
        ids = list_identity.sync(client=client)
        assert isinstance(ids, list)
        assert len(ids) == nb_identities

        # endpoint: GET /identity/{id}
        id = read_identity.sync(client=client, id=cast(int, ids[0].id))
        assert isinstance(id, Identity)


def test_identity_anon(sts):
    client = sts.get_client()

    ids = list_identity.sync(client=client)
    assert isinstance(ids, ErrorMessage)
