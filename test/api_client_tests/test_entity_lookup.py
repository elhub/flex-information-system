from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    EntityLookupRequest,
    EntityLookupRequestBusinessIdType,
    EntityLookupRequestType,
    EntityLookupResponse,
    ErrorMessage,
)
from flex.api.entity import (
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
            business_id_type=EntityLookupRequestBusinessIdType.ORG,
            name="TEST-ENTITY-LOOKUP",
            type_=EntityLookupRequestType.ORGANISATION,
        ),
    )
    assert isinstance(e, ErrorMessage)
    assert e.code == "HTTP400"

    # endpoint: POST /entity/lookup
    e = call_entity_lookup.sync(
        client=client_fiso,
        body=EntityLookupRequest(
            business_id="badformat",
            business_id_type=EntityLookupRequestBusinessIdType.ORG,
            name="TEST-ENTITY-LOOKUP",
            type_=EntityLookupRequestType.ORGANISATION,
        ),
    )
    assert isinstance(e, ErrorMessage)
    assert e.code == "HTTP400"

    # mismatching type / business ID (10 digits instead of 9 for org)
    e = call_entity_lookup.sync(
        client=client_fiso,
        body=EntityLookupRequest(
            business_id="4337000099",
            business_id_type=EntityLookupRequestBusinessIdType.ORG,
            name="TEST-ENTITY-LOOKUP",
            type_=EntityLookupRequestType.ORGANISATION,
        ),
    )
    assert isinstance(e, ErrorMessage)
    assert e.code == "HTTP400"

    # mismatching business_id_type vs type (org given for person)
    e = call_entity_lookup.sync(
        client=client_fiso,
        body=EntityLookupRequest(
            business_id="433700009",
            business_id_type=EntityLookupRequestBusinessIdType.ORG,
            name="TEST-ENTITY-LOOKUP",
            type_=EntityLookupRequestType.PERSON,
        ),
    )
    assert isinstance(e, ErrorMessage)
    assert e.code == "HTTP400"

    # invalid email
    e = call_entity_lookup.sync(
        client=client_fiso,
        body=EntityLookupRequest(
            business_id="notanemail",
            business_id_type=EntityLookupRequestBusinessIdType.EMAIL,
            name="TEST-ENTITY-LOOKUP",
            type_=EntityLookupRequestType.PERSON,
        ),
    )
    assert isinstance(e, ErrorMessage)
    assert e.code == "HTTP400"

    # empty name
    e = call_entity_lookup.sync(
        client=client_fiso,
        body=EntityLookupRequest(
            business_id="test@example.com",
            business_id_type=EntityLookupRequestBusinessIdType.EMAIL,
            name="",
            type_=EntityLookupRequestType.PERSON,
        ),
    )
    assert isinstance(e, ErrorMessage)
    assert e.code == "HTTP400"


def test_entity_lookup_fiso(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    es = list_entity.sync(client=client_fiso, business_id="eq.133700000")
    assert isinstance(es, list)
    assert len(es) == 1
    ent_id = es[0].id

    # lookup existing entity (organisation)
    el = call_entity_lookup.sync(
        client=client_fiso,
        body=EntityLookupRequest(
            business_id="133700000",
            business_id_type=EntityLookupRequestBusinessIdType.ORG,
            name="x",
            type_=EntityLookupRequestType.ORGANISATION,
        ),
    )
    assert isinstance(el, EntityLookupResponse)
    assert el.entity_id == ent_id

    def random_number(length):
        return "".join([random.choice(string.digits) for _ in range(length)])

    entities = list_entity.sync(client=client_fiso)
    assert isinstance(entities, list)

    existing_entities_ids = [e.id for e in entities]

    # lookup non-existing person entity by email
    el = call_entity_lookup.sync(
        client=client_fiso,
        body=EntityLookupRequest(
            business_id=f"test-lookup-{random_number(8)}@example.com",
            business_id_type=EntityLookupRequestBusinessIdType.EMAIL,
            name="TEST-ENTITY-LOOKUP-EMAIL",
            type_=EntityLookupRequestType.PERSON,
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
                business_id="test@example.com",
                business_id_type=EntityLookupRequestBusinessIdType.EMAIL,
                name="x",
                type_=EntityLookupRequestType.PERSON,
            ),
        )
        assert isinstance(e, ErrorMessage)
