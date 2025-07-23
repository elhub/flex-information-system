from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    EntityClientCreateRequest,
    EntityClientResponse,
    EntityClientUpdateRequest,
    ErrorMessage,
    EmptyObject,
)
from flex.api.entity_client import (
    read_entity_client,
    list_entity_client,
    update_entity_client,
    create_entity_client,
    delete_entity_client,
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

    # RLS: ECL-ENT001
    # RLS: ECL-ENT002
    # entity can do everything on their own clients

    # endpoint: GET /entity_client
    clts_ent = list_entity_client.sync(client=client_ent)
    assert isinstance(clts_ent, list)
    assert len(clts_ent) >= 1

    # endpoint: POST /entity_client
    clt = create_entity_client.sync(
        client=client_ent,
        body=EntityClientCreateRequest(entity_id=ent_id, name="test client name"),
    )
    assert isinstance(clt, EntityClientResponse)

    # endpoint: GET /entity_client/{id}
    clt = read_entity_client.sync(client=client_ent, id=cast(int, clt.id))
    assert isinstance(clt, EntityClientResponse)

    # min password length is 12
    e = update_entity_client.sync(
        client=client_ent,
        id=cast(int, clt.id),
        body=EntityClientUpdateRequest(client_secret="12345678901"),
    )
    assert isinstance(e, ErrorMessage)

    # endpoint: PATCH /entity_client/{id}
    u = update_entity_client.sync(
        client=client_ent,
        id=cast(int, clt.id),
        body=EntityClientUpdateRequest(client_secret="abcdefghijklm"),
    )
    assert not isinstance(u, ErrorMessage)

    # RLS: ECL-FISO001
    # FISO can read everything

    clt = read_entity_client.sync(client=client_fiso, id=cast(int, clt.id))
    assert isinstance(clt, EntityClientResponse)

    # but FISO or other entity cannot modify the resource for this entity

    e = create_entity_client.sync(
        client=client_other_ent,
        body=EntityClientCreateRequest(entity_id=ent_id, name="test client name"),
    )
    assert isinstance(e, ErrorMessage)

    e = create_entity_client.sync(
        client=client_fiso,
        body=EntityClientCreateRequest(entity_id=ent_id, name="test client name"),
    )
    assert isinstance(e, ErrorMessage)

    e = delete_entity_client.sync(
        client=client_fiso,
        id=cast(int, clt.id),
        body=EmptyObject(),
    )
    assert isinstance(e, ErrorMessage)

    # only the entity can delete its clients

    # endpoint: DELETE /entity_client/{id}
    d = delete_entity_client.sync(
        client=client_ent,
        id=cast(int, clt.id),
        body=EmptyObject(),
    )
    assert not isinstance(d, ErrorMessage)
