from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    ClientCreateRequest,
    ClientResponse,
    ClientUpdateRequest,
    ErrorMessage,
    EmptyObject,
)
from flex.api.client import (
    read_client,
    list_client,
    update_client,
    create_client,
    delete_client,
)
import pytest
from typing import cast


@pytest.fixture
def sts():
    yield SecurityTokenService()


def test_entity_client(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    client_ent = sts.get_client(TestEntity.TEST)
    client_other_ent = sts.get_client(TestEntity.COMMON)

    ent_id = sts.get_userinfo(client_ent)["entity_id"]

    # RLS: CLI-ENT001
    # entity can do everything on their own clients

    # endpoint: GET /client
    clts_ent = list_client.sync(client=client_ent)
    assert isinstance(clts_ent, list)
    assert len(clts_ent) >= 1

    # endpoint: POST /client
    clt = create_client.sync(
        client=client_ent,
        body=ClientCreateRequest(
            entity_id=ent_id,
            client_id="test_client",
        ),
    )
    assert isinstance(clt, ClientResponse)

    # endpoint: GET /client/{id}
    clt = read_client.sync(client=client_ent, id=cast(int, clt.id))
    assert isinstance(clt, ClientResponse)

    # endpoint: PATCH /client/{id}
    u = update_client.sync(
        client=client_ent,
        id=cast(int, clt.id),
        body=ClientUpdateRequest(secret="abcdefghijklm"),
    )
    assert not isinstance(u, ErrorMessage)

    # RLS: CLI-FISO001
    # FISO can read everything

    clt = read_client.sync(client=client_fiso, id=cast(int, clt.id))
    assert isinstance(clt, ClientResponse)

    # but FISO or other entity cannot modify the resource for this entity

    e = create_client.sync(
        client=client_other_ent,
        body=ClientCreateRequest(
            entity_id=ent_id,
            client_id="test_client",
        ),
    )
    assert isinstance(e, ErrorMessage)

    e = create_client.sync(
        client=client_fiso,
        body=ClientCreateRequest(
            entity_id=ent_id,
            client_id="test_client",
        ),
    )
    assert isinstance(e, ErrorMessage)

    e = delete_client.sync(client=client_fiso, id=cast(int, clt.id), body=EmptyObject())
    assert isinstance(e, ErrorMessage)

    # only the entity can delete its clients

    # endpoint: DELETE /client/{id}
    d = delete_client.sync(client=client_ent, id=cast(int, clt.id), body=EmptyObject())
    assert not isinstance(d, ErrorMessage)
