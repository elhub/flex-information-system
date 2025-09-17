from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    EntityLookupRequest,
    EntityLookupRequestType,
    EntityLookupResponse,
    EntityResponse,
    ErrorMessage,
)
from flex.api.entity import (
    read_entity,
    list_entity,
    call_entity_lookup,
)
import pytest
import random
import string


@pytest.fixture
def sts():
    yield SecurityTokenService()


def test_entity_lookup_params(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # ill formed requests

    # wrong business ID
    e = call_entity_lookup.sync(
        client=client_fiso,
        body=EntityLookupRequest(
            business_id="",
            name="TEST-ENTITY-LOOKUP",
            type=EntityLookupRequestType.ORGANISATION,
        ),
    )
    assert isinstance(e, ErrorMessage)
    assert e.code == "HTTP400"

    # endpoint: POST /entity/lookup
    e = call_entity_lookup.sync(
        client=client_fiso,
        body=EntityLookupRequest(
            business_id="badformat",
            name="TEST-ENTITY-LOOKUP",
            type=EntityLookupRequestType.ORGANISATION,
        ),
    )
    assert isinstance(e, ErrorMessage)
    assert e.code == "HTTP400"

    # mismatching type / business ID
    e = call_entity_lookup.sync(
        client=client_fiso,
        body=EntityLookupRequest(
            business_id="4337000099",
            name="TEST-ENTITY-LOOKUP",
            type=EntityLookupRequestType.ORGANISATION,
        ),
    )
    assert isinstance(e, ErrorMessage)
    assert e.code == "HTTP400"

    e = call_entity_lookup.sync(
        client=client_fiso,
        body=EntityLookupRequest(
            business_id="43370099",
            name="TEST-ENTITY-LOOKUP",
            type=EntityLookupRequestType.PERSON,
        ),
    )
    assert isinstance(e, ErrorMessage)
    assert e.code == "HTTP400"

    e = call_entity_lookup.sync(
        client=client_fiso,
        body=EntityLookupRequest(
            business_id="0337000099",
            name="TEST-ENTITY-LOOKUP",
            type=EntityLookupRequestType.PERSON,
        ),
    )
    assert isinstance(e, ErrorMessage)
    assert e.code == "HTTP400"

    # empty name
    e = call_entity_lookup.sync(
        client=client_fiso,
        body=EntityLookupRequest(
            business_id="4337000099",
            name="",
            type=EntityLookupRequestType.PERSON,
        ),
    )
    assert isinstance(e, ErrorMessage)
    assert e.code == "HTTP400"


def test_entity_lookup_fiso(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    e = read_entity.sync(
        client=client_fiso,
        id=1,
    )
    assert isinstance(e, EntityResponse)
    assert e.business_id == "13370000000"

    # lookup existing entity
    el = call_entity_lookup.sync(
        client=client_fiso,
        body=EntityLookupRequest(
            business_id="13370000000",
            name="x",
            type=EntityLookupRequestType.PERSON,
        ),
    )
    assert isinstance(el, EntityLookupResponse)

    assert el.entity_id == e.id

    def random_number(length):
        return "".join([random.choice(string.digits) for _ in range(length)])

    entities = list_entity.sync(client=client_fiso)
    assert isinstance(entities, list)

    existing_entities_ids = [e.id for e in entities]

    # lookup non-existing entity
    el = call_entity_lookup.sync(
        client=client_fiso,
        body=EntityLookupRequest(
            business_id="3" + random_number(10),
            name="TEST-ENTITY-LOOKUP",
            type=EntityLookupRequestType.PERSON,
        ),
    )
    assert isinstance(el, EntityLookupResponse)
    assert el.entity_id not in existing_entities_ids

    entities = list_entity.sync(client=client_fiso)
    assert isinstance(entities, list)
    assert len(entities) == len(existing_entities_ids) + 1


def test_entity_lookup_other(sts):
    roles_that_cannot_lookup = ["BRP", "ES", "EU", "MO", "SO", "SP", "TP"]

    for role in roles_that_cannot_lookup:
        e = call_entity_lookup.sync(
            client=sts.get_client(TestEntity.TEST, role),
            body=EntityLookupRequest(
                business_id="13370000000",
                name="x",
                type=EntityLookupRequestType.PERSON,
            ),
        )
        assert isinstance(e, ErrorMessage)
