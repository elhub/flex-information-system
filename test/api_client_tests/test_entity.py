from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    EntityResponse,
    ErrorMessage,
    PartyMembershipCreateRequest,
    PartyMembershipResponse,
    EmptyObject,
)
from flex.api.entity import (
    read_entity,
    list_entity,
)
from flex.api.party_membership import (
    create_party_membership,
    delete_party_membership,
)
import pytest
from typing import cast


@pytest.fixture
def sts():
    yield SecurityTokenService()


# RLS: ENT-FISO001
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


def test_entity_com(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    entities = list_entity.sync(client=client_fiso)
    assert isinstance(entities, list)
    n_organisations = len(
        list(
            filter(
                lambda ent: ent.type == "organisation",
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


# RLS: ENT-ENT001
def test_entity_ent(sts):
    client_ent = sts.get_client(TestEntity.TEST)

    entities_ent = list_entity.sync(client=client_ent)
    assert isinstance(entities_ent, list)
    assert len(entities_ent) == 1
    assert entities_ent[0].type == "person"


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
            if ent.type == "organisation"
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
