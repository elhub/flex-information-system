from security_token_service import (
    SecurityTokenService,
    TestEntityClient,
)
from flex.models import (
    EntityClientCreateRequest,
    EntityClientResponse,
    EntityClientUpdateRequest,
    AuthScope,
    PartyResponse,
    PartyMembershipCreateRequest,
    PartyMembershipResponse,
    PartyCreateRequest,
    PartyBusinessIdType,
    PartyRole,
    PartyType,
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
from flex.api.party import (
    read_party,
    create_party,
)
from flex.api.party_membership import (
    create_party_membership,
    delete_party_membership,
)
from test_party import (
    unique_gln,
)
import pytest
from typing import cast


@pytest.fixture
def sts():
    yield SecurityTokenService()


def test_entity_client_fiso(sts):
    client_fiso = sts.get_client(TestEntityClient.TEST, "FISO")

    client_ent = sts.get_client(TestEntityClient.TEST)
    client_other_ent = sts.get_client(TestEntityClient.COMMON)

    ent_id = sts.get_userinfo(client_ent)["entity_id"]

    # RLS: ECL-ENT001
    # entity can do everything on their own clients, but only as a human (so PATCH and POST should fail)

    # endpoint: GET /entity_client
    clts_ent = list_entity_client.sync(client=client_ent)
    assert isinstance(clts_ent, list)
    assert len(clts_ent) >= 1

    # endpoint: POST /entity_client
    clt = create_entity_client.sync(
        client=client_ent,
        body=EntityClientCreateRequest(
            entity_id=ent_id,
            name="test client name",
            scopes=[AuthScope.MANAGEDATA, AuthScope.MANAGEAUTH],
        ),
    )
    assert isinstance(clt, ErrorMessage)

    # endpoint: GET /entity_client/{id}
    clt = read_entity_client.sync(client=client_ent, id=cast(int, clts_ent[0].id))
    assert isinstance(clt, EntityClientResponse)

    # endpoint: PATCH /entity_client/{id}
    u = update_entity_client.sync(
        client=client_ent,
        id=cast(int, clt.id),
        body=EntityClientUpdateRequest(name="updated client name"),
    )
    assert isinstance(u, ErrorMessage)

    # RLS: ECL-FISO001
    # FISO can read everything

    clt = read_entity_client.sync(client=client_fiso, id=cast(int, clt.id))
    assert isinstance(clt, EntityClientResponse)

    # but FISO or other entity cannot modify the resource for this entity

    e = create_entity_client.sync(
        client=client_other_ent,
        body=EntityClientCreateRequest(
            entity_id=ent_id,
            name="test client name",
            scopes=[AuthScope.MANAGEDATA, AuthScope.MANAGEAUTH],
        ),
    )
    assert isinstance(e, ErrorMessage)

    e = create_entity_client.sync(
        client=client_fiso,
        body=EntityClientCreateRequest(
            entity_id=ent_id,
            name="test client name",
            scopes=[AuthScope.MANAGEDATA, AuthScope.MANAGEAUTH],
        ),
    )
    assert isinstance(e, ErrorMessage)


def test_entity_client_human(sts):
    # RLS: ECL-ENT002
    # a human can create, update and delete their own clients (unlike a client)
    client_fiso = sts.get_client(TestEntityClient.TEST, "FISO")
    client_ent = sts.get_client(TestEntityClient.TEST)
    client_other_ent = sts.get_client(TestEntityClient.COMMON)
    client_human = sts.get_human_client()

    ent_id = sts.get_userinfo(client_ent)["entity_id"]
    other_ent_id = sts.get_userinfo(client_other_ent)["entity_id"]

    # endpoint: POST /entity_client
    clt = create_entity_client.sync(
        client=client_human,
        body=EntityClientCreateRequest(
            entity_id=ent_id,
            name="test client name",
            scopes=[AuthScope.MANAGEDATA, AuthScope.MANAGEAUTH],
        ),
    )
    assert isinstance(clt, EntityClientResponse)
    clt_id = cast(int, clt.id)

    # not for another entity
    e = create_entity_client.sync(
        client=client_human,
        body=EntityClientCreateRequest(
            entity_id=other_ent_id,
            name="test client name",
            scopes=[AuthScope.MANAGEDATA, AuthScope.MANAGEAUTH],
        ),
    )
    assert isinstance(e, ErrorMessage)

    # endpoint: GET /entity_client/{id}
    r = read_entity_client.sync(client=client_human, id=clt_id)
    assert isinstance(r, EntityClientResponse)

    # endpoint: PATCH /entity_client/{id}
    u = update_entity_client.sync(
        client=client_human,
        id=clt_id,
        body=EntityClientUpdateRequest(name="updated client name"),
    )
    assert isinstance(u, EntityClientResponse)
    assert u.name == "updated client name"

    # -------- test of restrictions on the party field

    # set up two parties, one owned by each test entity

    p = create_party.sync(
        client=client_fiso,
        body=PartyCreateRequest(
            name="New Party Entity Client Test",
            business_id=unique_gln(),
            business_id_type=PartyBusinessIdType.GLN,
            role=PartyRole.FLEX_SERVICE_PROVIDER,
            type_=PartyType.SERVICE_PROVIDER,
            entity_id=ent_id,
        ),
    )
    assert isinstance(p, PartyResponse)

    p2 = create_party.sync(
        client=client_fiso,
        body=PartyCreateRequest(
            name="New Party Entity Client Test 2",
            business_id=unique_gln(),
            business_id_type=PartyBusinessIdType.GLN,
            role=PartyRole.FLEX_ENERGY_SUPPLIER,
            type_=PartyType.ENERGY_SUPPLIER,
            entity_id=other_ent_id,
        ),
    )
    assert isinstance(p2, PartyResponse)

    # the entity can assume an owned party, so it can set up a client for it
    u = update_entity_client.sync(
        client=client_human,
        id=clt_id,
        body=EntityClientUpdateRequest(party_id=cast(int, p.id)),
    )
    assert isinstance(u, EntityClientResponse)

    # not the other one
    e = update_entity_client.sync(
        client=client_human,
        id=clt_id,
        body=EntityClientUpdateRequest(party_id=cast(int, p2.id)),
    )
    assert isinstance(e, ErrorMessage)

    # once the entity is a member of the other party, it can
    pm = create_party_membership.sync(
        client=client_fiso,
        body=PartyMembershipCreateRequest(
            party_id=cast(int, p2.id),
            entity_id=ent_id,
            scopes=[AuthScope.MANAGEAUTH, AuthScope.MANAGEDATAENTITY_CLIENT],
        ),
    )
    assert isinstance(pm, PartyMembershipResponse)

    u = update_entity_client.sync(
        client=client_human,
        id=clt_id,
        body=EntityClientUpdateRequest(party_id=cast(int, p2.id)),
    )
    assert isinstance(u, EntityClientResponse)

    # --------

    # FISO and the entity client cannot delete it
    for c in (client_fiso, client_ent):
        e = delete_entity_client.sync(
            client=c,
            id=clt_id,
            body=EmptyObject(),
        )
        assert isinstance(e, ErrorMessage)

    # endpoint: DELETE /entity_client/{id}
    d = delete_entity_client.sync(
        client=client_human,
        id=clt_id,
        body=EmptyObject(),
    )
    assert not isinstance(d, ErrorMessage)

    d = delete_party_membership.sync(
        client=client_fiso,
        id=cast(int, pm.id),
        body=EmptyObject(),
    )
    assert not isinstance(d, ErrorMessage)


def test_entity_client_org(sts):
    client_fiso = sts.get_client(TestEntityClient.TEST, "FISO")

    client_org = sts.get_client(TestEntityClient.TEST, "ORG")
    org_info = sts.get_userinfo(client_org)
    org_pty_id = org_info["party_id"]

    p = read_party.sync(client=client_fiso, id=cast(int, org_pty_id))
    assert isinstance(p, PartyResponse)
    org_ent_id = p.entity_id

    # RLS: ECL-ORG001

    # the org party can read its clients

    clients = list_entity_client.sync(client=client_org, entity_id=f"eq.{org_ent_id}")
    assert isinstance(clients, list)
    assert len(clients) >= 1

    # Note:
    # ECL-ORG002 restricts insert/update/delete on entity clients to clients on
    # the owning entity, but also the operations must be done by a human, so
    # this policy cannot be tested automatically (on purpose). Only *negative*
    # testing is done below.
    #
    # Manual tests are done by logging in as a person entity, assuming an ORG
    # party, and trying to edit clients on the entity owning the party.

    # test that person entities with entity client get the policies denied
    # (they respect 1 of the 2 conditions)

    e = create_entity_client.sync(
        client=client_org,
        body=EntityClientCreateRequest(
            entity_id=org_ent_id,
            name="test client name",
            scopes=[AuthScope.MANAGEDATA, AuthScope.MANAGEAUTH],
        ),
    )
    assert isinstance(e, ErrorMessage)

    # Pick a client to play around with
    clts_ent = list_entity_client.sync(client=client_org, entity_id=f"eq.{org_ent_id}")
    assert isinstance(clts_ent, list)
    assert len(clts_ent) >= 1

    clt = clts_ent[0]

    e = update_entity_client.sync(
        client=client_org,
        id=cast(int, clt.id),
        body=EntityClientUpdateRequest(name="updated client name"),
    )
    assert isinstance(e, ErrorMessage)

    e = delete_entity_client.sync(
        client=client_org,
        id=cast(int, clt.id),
        body=EmptyObject(),
    )
    assert isinstance(e, ErrorMessage)

    # test that org entities with entity client get the policy denied
    # (they respect none of the 2 conditions)

    client_org_with_org_ent = sts.get_client(TestEntityClient.TEST_ORG, "ORG")

    e = update_entity_client.sync(
        client=client_org_with_org_ent,
        id=cast(int, clt.id),
        body=EntityClientUpdateRequest(name="updated client name"),
    )
    assert isinstance(e, ErrorMessage)

    e = create_entity_client.sync(
        client=client_org_with_org_ent,
        body=EntityClientCreateRequest(
            entity_id=org_ent_id,
            name="test client name",
            scopes=[AuthScope.MANAGEDATA, AuthScope.MANAGEAUTH],
        ),
    )
    assert isinstance(e, ErrorMessage)

    e = delete_entity_client.sync(
        client=client_org_with_org_ent,
        id=cast(int, clt.id),
        body=EmptyObject(),
    )
    assert isinstance(e, ErrorMessage)
