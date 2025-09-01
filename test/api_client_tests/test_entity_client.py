from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    EntityClientCreateRequest,
    EntityClientResponse,
    EntityClientUpdateRequest,
    AuthScope,
    PartyMembershipCreateRequest,
    PartyMembershipUpdateRequest,
    PartyMembershipResponse,
    PartyCreateRequest,
    PartyBusinessIdType,
    PartyResponse,
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
from test_party import (
    unique_gln,
)
from flex.api.party_membership import (
    list_party_membership,
    update_party_membership,
    create_party_membership,
    delete_party_membership,
)
import pytest
from typing import cast


@pytest.fixture
def sts():
    yield SecurityTokenService()


def test_entity_client_fiso(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    client_ent = sts.get_client(TestEntity.TEST)
    client_other_ent = sts.get_client(TestEntity.COMMON)

    ent_id = sts.get_userinfo(client_ent)["entity_id"]
    other_ent_id = sts.get_userinfo(client_other_ent)["entity_id"]

    # RLS: ECL-ENT001
    # entity can do everything on their own clients

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

    # -------- test of restrictions on the party field

    # set up two parties, one owned by each test entity

    p = create_party.sync(
        client=client_fiso,
        body=PartyCreateRequest(
            name="New Party Entity Client Test",
            business_id=unique_gln(),
            business_id_type=PartyBusinessIdType.GLN,
            role="flex_service_provider",
            type="service_provider",
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
            role="flex_energy_supplier",
            type="energy_supplier",
            entity_id=other_ent_id,
        ),
    )
    assert isinstance(p2, PartyResponse)

    # party ownership test
    # entity can assume an owned party, so it should be able to set up a client for it

    u = update_entity_client.sync(
        client=client_ent,
        id=cast(int, clt.id),
        body=EntityClientUpdateRequest(party_id=cast(int, p.id)),
    )
    assert not isinstance(u, ErrorMessage)

    # not the other one

    e = update_entity_client.sync(
        client=client_ent,
        id=cast(int, clt.id),
        body=EntityClientUpdateRequest(party_id=cast(int, p2.id)),
    )
    assert isinstance(e, ErrorMessage)

    # party membership test
    # if the entity is added to the other party, it should now be able to set up a client for it

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
        client=client_ent,
        id=cast(int, clt.id),
        body=EntityClientUpdateRequest(party_id=cast(int, p2.id)),
    )
    assert not isinstance(u, ErrorMessage)

    # --------

    # cleanup + only entity can delete their own clients

    e = delete_entity_client.sync(
        client=client_fiso,
        id=cast(int, clt.id),
        body=EmptyObject(),
    )
    assert isinstance(e, ErrorMessage)

    # endpoint: DELETE /entity_client/{id}
    d = delete_entity_client.sync(
        client=client_ent,
        id=cast(int, clt.id),
        body=EmptyObject(),
    )
    assert not isinstance(d, ErrorMessage)


def test_entity_client_org(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    client_org = sts.get_client(TestEntity.TEST, "ORG")
    org_info = sts.get_userinfo(client_org)
    ent_id = org_info["entity_id"]
    org_pty_id = org_info["party_id"]

    pms = list_party_membership.sync(
        client=client_fiso,
        entity_id=f"eq.{ent_id}",
        party_id=f"eq.{org_pty_id}",
    )
    assert isinstance(pms, list)
    assert len(pms) == 1
    org_pm = pms[0]

    p = read_party.sync(client=client_fiso, id=cast(int, org_pty_id))
    assert isinstance(p, PartyResponse)
    org_ent_id = p.entity_id

    # RLS: ECL-ORG001
    # RLS: ECL-ORG002

    # set admin scope and re-log-in

    u = update_party_membership.sync(
        client=client_fiso,
        id=cast(int, org_pm.id),
        body=PartyMembershipUpdateRequest(
            scopes=[
                AuthScope.MANAGEAUTH,  # login + userinfo
                AuthScope.READDATA,
                AuthScope.MANAGEDATAENTITY_CLIENT,
            ],
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    client_org = sts.get_client(TestEntity.TEST, "ORG", reset=True)

    # now the org party can read its clients

    clients = list_entity_client.sync(client=client_org, entity_id=f"eq.{org_ent_id}")
    assert isinstance(clients, list)
    assert len(clients) >= 1

    # they can also do everything

    clt = create_entity_client.sync(
        client=client_org,
        body=EntityClientCreateRequest(
            entity_id=org_ent_id,
            name="test client name",
            scopes=[AuthScope.MANAGEDATA, AuthScope.MANAGEAUTH],
        ),
    )
    assert isinstance(clt, EntityClientResponse)

    u = update_entity_client.sync(
        client=client_org,
        id=cast(int, clt.id),
        body=EntityClientUpdateRequest(client_secret="123456789012345"),
    )
    assert not isinstance(u, ErrorMessage)

    # -------- btw, test that org entities get the policy denied

    # TODO: remove this step when scopes are fixed when assuming a party through
    #       party ownership (currently, if we do this, we get empty scopes)
    # make ORG entity member of the ORG party, also admin

    client_org_with_org_ent = sts.get_client(TestEntity.TEST_ORG, None)
    org_ent_id = sts.get_userinfo(client_org_with_org_ent)["entity_id"]

    pm = create_party_membership.sync(
        client=client_fiso,
        body=PartyMembershipCreateRequest(
            party_id=cast(int, org_pty_id),
            entity_id=org_ent_id,
            scopes=[AuthScope.MANAGEAUTH, AuthScope.MANAGEDATAENTITY_CLIENT],
        ),
    )
    assert isinstance(pm, PartyMembershipResponse)

    # log in as ORG party through ORG entity and check what we just did above
    # is impossible in this case

    client_org_with_org_ent = sts.get_client(TestEntity.TEST_ORG, "ORG")

    e = update_entity_client.sync(
        client=client_org_with_org_ent,
        id=cast(int, clt.id),
        body=EntityClientUpdateRequest(client_secret="4321432143214321"),
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

    # cleanup

    d = delete_party_membership.sync(
        client=client_fiso,
        id=cast(int, pm.id),
        body=EmptyObject(),
    )
    assert not isinstance(d, ErrorMessage)

    # --------- going back to the test we were doing

    # remove admin scope

    u = update_party_membership.sync(
        client=client_fiso,
        id=cast(int, org_pm.id),
        body=PartyMembershipUpdateRequest(
            scopes=[AuthScope.MANAGEAUTH, AuthScope.READDATA],
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    client_org = sts.get_client(TestEntity.TEST, "ORG", reset=True)

    # they can no longer do the operations

    e = update_entity_client.sync(
        client=client_org,
        id=cast(int, clt.id),
        body=EntityClientUpdateRequest(client_secret="123456789012345"),
    )
    assert isinstance(e, ErrorMessage)

    e = delete_entity_client.sync(
        client=client_org,
        id=cast(int, clt.id),
        body=EmptyObject(),
    )
    assert isinstance(e, ErrorMessage)

    # cleanup

    u = update_party_membership.sync(
        client=client_fiso,
        id=cast(int, org_pm.id),
        body=PartyMembershipUpdateRequest(
            scopes=[
                AuthScope.MANAGEAUTH,
                AuthScope.READDATA,
                AuthScope.MANAGEDATAENTITY_CLIENT,
            ],
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    client_org = sts.get_client(TestEntity.TEST, "ORG", reset=True)

    d = delete_entity_client.sync(
        client=client_org,
        id=cast(int, clt.id),
        body=EmptyObject(),
    )
    assert not isinstance(d, ErrorMessage)
