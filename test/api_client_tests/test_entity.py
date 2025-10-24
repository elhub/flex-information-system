from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    AuthScope,
    EntityCreateRequest,
    EntityUpdateRequest,
    EntityResponse,
    ErrorMessage,
    PartyMembershipCreateRequest,
    PartyMembershipResponse,
    EmptyObject,
    PartyResponse,
)
from flex.api.entity import (
    read_entity,
    list_entity,
    create_entity,
    update_entity,
)
from flex.api.party import (
    read_party,
    list_party,
)
from flex.api.party_membership import (
    create_party_membership,
    delete_party_membership,
)
import pytest
from typing import cast
import random
import string


@pytest.fixture
def sts():
    yield SecurityTokenService()


def random_email():
    return (
        "".join([random.choice(string.ascii_lowercase) for _ in range(10)])
        + "@example.com"
    )


def random_number(length):
    return "".join([random.choice(string.digits) for _ in range(length)])


def random_gsrn():
    return "9" + random_number(17)


def random_org():
    return "8" + random_number(8)


def random_pid():
    return "4" + random_number(10)


# RLS: ENT-FISO001
# RLS: ENT-FISO002
def test_entity_fiso(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # endpoint: GET /entity
    entities = list_entity.sync(client=client_fiso)
    assert isinstance(entities, list)

    ent_id = sts.get_userinfo(sts.get_client(TestEntity.TEST))["entity_id"]

    # endpoint: GET /entity/{id}
    e = read_entity.sync(client=client_fiso, id=ent_id)
    assert isinstance(e, EntityResponse)
    assert e.name == "Test Suite"
    e2 = list_entity.sync(client=client_fiso, id=f"eq.{ent_id}")
    assert isinstance(e2, list)
    assert len(e2) == 1
    assert e2[0] == e

    # organisation -> only org

    # endpoint: POST /entity
    e = create_entity.sync(
        client=client_fiso,
        body=EntityCreateRequest(
            name="Test Entity",
            business_id=random_pid(),
            business_id_type="pid",
            type_="organisation",
        ),
    )
    assert isinstance(e, ErrorMessage)

    e = create_entity.sync(
        client=client_fiso,
        body=EntityCreateRequest(
            name="Test Entity",
            business_id=random_gsrn(),
            business_id_type="gsrn",
            type_="organisation",
        ),
    )
    assert isinstance(e, ErrorMessage)

    e = create_entity.sync(
        client=client_fiso,
        body=EntityCreateRequest(
            name="Test Entity",
            business_id=random_pid(),
            business_id_type="org",
            type_="organisation",
        ),
    )
    assert isinstance(e, ErrorMessage)

    e = create_entity.sync(
        client=client_fiso,
        body=EntityCreateRequest(
            name="Test Entity",
            business_id=random_org(),
            business_id_type="pid",
            type_="organisation",
        ),
    )
    assert isinstance(e, ErrorMessage)

    e = create_entity.sync(
        client=client_fiso,
        body=EntityCreateRequest(
            name="Test Entity VALID ORG",
            business_id=random_org(),
            business_id_type="org",
            type_="organisation",
        ),
    )
    assert isinstance(e, EntityResponse)

    # person -> email or pid

    e = create_entity.sync(
        client=client_fiso,
        body=EntityCreateRequest(
            name="Test Entity",
            business_id=random_gsrn(),
            business_id_type="gsrn",
            type_="person",
        ),
    )
    assert isinstance(e, ErrorMessage)

    e = create_entity.sync(
        client=client_fiso,
        body=EntityCreateRequest(
            name="Test Entity",
            business_id=random_org(),
            business_id_type="org",
            type_="person",
        ),
    )
    assert isinstance(e, ErrorMessage)

    e = create_entity.sync(
        client=client_fiso,
        body=EntityCreateRequest(
            name="Test Entity",
            business_id=random_org(),
            business_id_type="pid",
            type_="person",
        ),
    )
    assert isinstance(e, ErrorMessage)

    e = create_entity.sync(
        client=client_fiso,
        body=EntityCreateRequest(
            name="Test Entity",
            business_id=random_email(),
            business_id_type="pid",
            type_="person",
        ),
    )
    assert isinstance(e, ErrorMessage)

    e = create_entity.sync(
        client=client_fiso,
        body=EntityCreateRequest(
            name="Test Entity",
            business_id=random_pid(),
            business_id_type="email",
            type_="person",
        ),
    )
    assert isinstance(e, ErrorMessage)

    e = create_entity.sync(
        client=client_fiso,
        body=EntityCreateRequest(
            name="Test Entity VALID EMAIL",
            business_id=random_email(),
            business_id_type="email",
            type_="person",
        ),
    )
    assert isinstance(e, EntityResponse)

    e = create_entity.sync(
        client=client_fiso,
        body=EntityCreateRequest(
            name="Test Entity VALID PID",
            business_id=random_pid(),
            business_id_type="pid",
            type_="person",
        ),
    )
    assert isinstance(e, EntityResponse)

    # update OK

    # endpoint: PATCH /entity/{id}
    u = update_entity.sync(
        client=client_fiso,
        id=cast(int, e.id),
        body=EntityUpdateRequest(
            name="Test Entity Updated",
        ),
    )
    assert not isinstance(u, ErrorMessage)


def test_entity_org(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    client_org = sts.get_client(TestEntity.TEST, "ORG")

    pty_org = read_party.sync(
        client=client_org,
        id=sts.get_userinfo(client_org)["party_id"],
    )
    assert isinstance(pty_org, PartyResponse)

    # entity ID of the organisation
    org_ent_id = cast(int, pty_org.entity_id)

    # parties owned by the organisation entity
    ptys = list_party.sync(client=client_org, entity_id=f"eq.{org_ent_id}")
    assert isinstance(ptys, list)

    # pick one, for instance the energy supplier
    pty_es = next((p for p in ptys if p.type_ == "energy_supplier"))

    # new entity
    ent = create_entity.sync(
        client=client_fiso,
        body=EntityCreateRequest(
            name="Test Entity Seen By Org",
            business_id=random_pid(),
            business_id_type="pid",
            type_="person",
        ),
    )
    assert isinstance(ent, EntityResponse)

    # RLS: ENT-ORG001

    # by default, no reason for the organisation to see the new entity
    e = read_entity.sync(client=client_org, id=cast(int, ent.id))
    assert isinstance(e, ErrorMessage)

    # add it to the party
    pm = create_party_membership.sync(
        client=client_fiso,
        body=PartyMembershipCreateRequest(
            entity_id=cast(int, ent.id),
            party_id=cast(int, pty_es.id),
            scopes=[AuthScope.READDATA, AuthScope.MANAGEAUTH],
        ),
    )
    assert isinstance(pm, PartyMembershipResponse)

    # organisation should see the new entity
    ent = read_entity.sync(client=client_org, id=cast(int, ent.id))
    assert isinstance(ent, EntityResponse)

    # teardown
    d = delete_party_membership.sync(
        client=client_fiso, id=cast(int, pm.id), body=EmptyObject()
    )
    assert not isinstance(d, ErrorMessage)

    # organisation should by default see the entity with email business id type
    # TODO this is a temporary solution for pilot testing w/ email based entities
    # RLS: ENT-ORG002
    ent = list_entity.sync(client=client_org, business_id_type="eq.email")
    assert isinstance(ent, list)
    assert len(ent) >= 1


def test_entity_com(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    entities = list_entity.sync(client=client_fiso)
    assert isinstance(entities, list)
    n_organisations = len(
        list(
            filter(
                lambda ent: ent.type_ == "organisation",
                entities,
            )
        )
    )

    # RLS: ENT-COM001
    for role in sts.COMMON_ROLES:
        client = sts.get_client(TestEntity.TEST, role)

        visible_entities = list_entity.sync(client=client)
        assert isinstance(visible_entities, list)
        assert len(visible_entities) >= n_organisations

    # RLS: ENT-COM002
    # add COMMON entity to TEST SO so they are 2 entities in the party
    common_ent_id = sts.get_userinfo(sts.get_client(TestEntity.COMMON))["entity_id"]

    client_so = sts.get_client(TestEntity.TEST, "SO")
    so_id = sts.get_userinfo(client_so)["party_id"]

    pm = create_party_membership.sync(
        client=client_fiso,
        body=PartyMembershipCreateRequest(
            entity_id=common_ent_id,
            party_id=so_id,
            scopes=[AuthScope.READDATA, AuthScope.READAUTH],
        ),
    )
    assert isinstance(pm, PartyMembershipResponse)

    # SO should now see both entities
    so_entities = list_entity.sync(client=client_so)
    assert isinstance(so_entities, list)
    assert len([ent for ent in so_entities if ent.id == common_ent_id]) == 1

    # teardown
    d = delete_party_membership.sync(
        client=client_fiso, id=cast(int, pm.id), body=EmptyObject()
    )
    assert not isinstance(d, ErrorMessage)

    # RLS: ENT-COM003
    # SO can read parent entity
    p = read_party.sync(
        client=client_fiso,
        id=so_id,
    )
    assert isinstance(p, PartyResponse)

    e = read_entity.sync(
        client=client_so,
        id=cast(int, p.entity_id),
    )
    assert isinstance(e, EntityResponse)


# RLS: ENT-ENT001
def test_entity_ent(sts):
    client_ent = sts.get_client(TestEntity.TEST)

    entities_ent = list_entity.sync(client=client_ent)
    assert isinstance(entities_ent, list)
    assert len(entities_ent) == 1
    assert entities_ent[0].type_ == "person"


def test_rla_absence(sts):
    # ENT-COM001 gives access to part of the entities to everybody
    nb_default_visible_entities = len(
        [
            ent
            for ent in cast(
                list,
                list_entity.sync(
                    client=sts.get_client(TestEntity.TEST, "FISO"),
                ),
            )
            if ent.type_ == "organisation"
        ]
    )

    roles_without_rla = ["BRP", "EU", "ES", "MO", "SO", "SP", "TP"]

    for role in roles_without_rla:
        ents = list_entity.sync(
            client=sts.get_client(TestEntity.TEST, role),
        )
        assert isinstance(ents, list)
        # ENT-ENT001 grants one more entity : the user itself
        assert len(ents) == nb_default_visible_entities + 1
