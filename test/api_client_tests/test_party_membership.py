from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    AuthScope,
    PartyMembershipResponse,
    PartyMembershipCreateRequest,
    PartyMembershipUpdateRequest,
    PartyMembershipHistoryResponse,
    PartyCreateRequest,
    PartyBusinessIdType,
    PartyResponse,
    ErrorMessage,
    EmptyObject,
)
from flex.api.party import (
    list_party,
    create_party,
    read_party,
)
from flex.api.party_membership import (
    create_party_membership,
    list_party_membership,
    read_party_membership,
    delete_party_membership,
    update_party_membership,
    list_party_membership_history,
    read_party_membership_history,
)
from typing import cast
import pytest
from test_party import (
    unique_gln,
)


@pytest.fixture
def sts():
    yield SecurityTokenService()


# RLS: PTYM-FISO001
def test_ptym_fiso(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    # endpoint: GET /party_membership
    pms = list_party_membership.sync(client=client_fiso)
    assert isinstance(pms, list)
    assert len(pms) > 0

    client_ent = sts.get_client(TestEntity.COMMON)
    ent_id = sts.get_userinfo(client_ent)["entity_id"]
    client_so = sts.get_client(TestEntity.TEST, "SO")
    pty_id = sts.get_userinfo(client_so)["party_id"]
    # delete party membership if it already exists
    for pm in pms:
        if pm.entity_id == ent_id and pm.party_id == pty_id:
            # endpoint: DELETE /party_membership/{id}
            delete_party_membership.sync(
                client=client_fiso, id=cast(int, pm.id), body=EmptyObject()
            )

    # endpoint: POST /party_membership
    pm = create_party_membership.sync(
        client=client_fiso,
        body=PartyMembershipCreateRequest(
            entity_id=ent_id,
            party_id=pty_id,
            scopes=[AuthScope.MANAGEAUTH],
        ),
    )
    assert isinstance(pm, PartyMembershipResponse)

    # RLS: PTYM-FISO002
    # endpoint: GET /party_membership_history/{id}
    pmh = read_party_membership_history.sync(
        client=client_fiso,
        id=cast(int, pm.id),
    )
    assert isinstance(pmh, PartyMembershipHistoryResponse)

    # endpoint: GET /party_membership/{id}
    p = read_party_membership.sync(client=client_fiso, id=cast(int, pm.id))
    assert isinstance(p, PartyMembershipResponse)
    p2 = list_party_membership.sync(
        client=client_fiso,
        id=f"eq.{cast(int, pm.id)}",
    )
    assert isinstance(p2, list)
    assert len(p2) == 1
    assert p2[0] == p

    # endpoint: PATCH /party_membership/{id}
    u = update_party_membership.sync(
        client=client_fiso,
        id=cast(int, p.id),
        body=PartyMembershipUpdateRequest(
            scopes=[AuthScope.MANAGEAUTH],
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    d = delete_party_membership.sync(
        client=client_fiso, id=cast(int, pm.id), body=EmptyObject()
    )
    assert not (isinstance(d, ErrorMessage))


def test_ptym_ent(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    client_ent = sts.get_client(TestEntity.TEST, "ENT")
    ent_id = sts.get_userinfo(client_ent)["entity_id"]

    # RLS: PTYM-ENT001
    pms_concerning_ent = list_party_membership.sync(
        client=client_fiso, entity_id=f"eq.{ent_id}"
    )
    assert isinstance(pms_concerning_ent, list)

    pms = list_party_membership.sync(client=client_ent)
    assert isinstance(pms, list)
    assert len(pms) == len(pms_concerning_ent)

    # RLS: PTYM-ENT002
    parties_owned_by_ent = list_party.sync(
        client=client_fiso,
        entity_id=f"eq.{ent_id}",
    )
    assert isinstance(parties_owned_by_ent, list)
    parties_owned_by_ent = [p.id for p in parties_owned_by_ent]

    all_pms = list_party_membership.sync(
        client=client_fiso,
        limit="10000",
    )
    assert isinstance(all_pms, list)

    for pm in all_pms:
        if pm.party_id in parties_owned_by_ent:
            pm = read_party_membership.sync(client=client_ent, id=cast(int, pm.id))
            assert isinstance(pm, PartyMembershipResponse)


# RLS: PTYM-ORG001
def test_ptym_org(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    client_org = sts.get_client(TestEntity.TEST, "ORG")
    org_info = sts.get_userinfo(client_org)
    ent_id = org_info["entity_id"]
    org_pty_id = org_info["party_id"]

    p = read_party.sync(client=client_fiso, id=cast(int, org_pty_id))
    assert isinstance(p, PartyResponse)
    org_ent_id = p.entity_id

    # create party owned by the org entity

    p = create_party.sync(
        client=client_fiso,
        body=PartyCreateRequest(
            name="Test Org SP",
            entity_id=org_ent_id,
            role="flex_service_provider",
            type_="service_provider",
            business_id_type=PartyBusinessIdType.GLN,
            business_id=unique_gln(),
        ),
    )
    assert isinstance(p, PartyResponse)

    # add the other entity as a member

    client_other_ent = sts.get_client(TestEntity.COMMON, "ENT")
    other_ent_id = sts.get_userinfo(client_other_ent)["entity_id"]

    pm = create_party_membership.sync(
        client=client_fiso,
        body=PartyMembershipCreateRequest(
            entity_id=other_ent_id,
            party_id=cast(int, p.id),
            scopes=[AuthScope.READAUTH],
        ),
    )
    assert not isinstance(pm, ErrorMessage)

    # set admin scope on the org party

    pms = list_party_membership.sync(
        client=client_fiso,
        entity_id=f"eq.{ent_id}",
        party_id=f"eq.{org_pty_id}",
    )
    assert isinstance(pms, list)
    assert len(pms) == 1
    org_pm = pms[0]

    u = update_party_membership.sync(
        client=client_fiso,
        id=cast(int, org_pm.id),
        body=PartyMembershipUpdateRequest(
            scopes=[
                AuthScope.MANAGEDATAPARTY_MEMBERSHIP,
                AuthScope.READDATA,
            ],
        ),
    )
    assert not (isinstance(u, ErrorMessage))
    client_org = sts.get_client(TestEntity.TEST, "ORG", reset=True)

    # now the org party can read and change party memberships on the new party

    pms = list_party_membership.sync(client=client_org, party_id=f"eq.{p.id}")
    assert isinstance(pms, list)
    assert len(pms) == 1

    u = update_party_membership.sync(
        client=client_org,
        id=cast(int, pms[0].id),
        body=PartyMembershipUpdateRequest(
            scopes=[AuthScope.READDATA],
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    d = delete_party_membership.sync(
        client=client_org,
        id=cast(int, pms[0].id),
        body=EmptyObject(),
    )
    assert not isinstance(d, ErrorMessage)

    # --------------------------------------------------------------------------
    # RLS: PTYM-ORG002
    # they can read history on such PM

    pmhs = list_party_membership_history.sync(
        client=client_org,
        party_membership_id=f"eq.{cast(int, pms[0].id)}",
    )
    assert isinstance(pmhs, list)
    assert len(pmhs) > 0

    # --------------------------------------------------------------------------

    pm = create_party_membership.sync(
        client=client_org,
        body=PartyMembershipCreateRequest(
            entity_id=other_ent_id,
            party_id=cast(int, p.id),
            scopes=[AuthScope.READAUTH],
        ),
    )
    assert isinstance(pm, PartyMembershipResponse)

    # remove admin scope

    u = update_party_membership.sync(
        client=client_fiso,
        id=cast(int, org_pm.id),
        body=PartyMembershipUpdateRequest(
            scopes=[AuthScope.READAUTH],
        ),
    )
    assert not (isinstance(u, ErrorMessage))
    client_org = sts.get_client(TestEntity.TEST, "ORG", reset=True)

    # they can no longer do the operations

    e = update_party_membership.sync(
        client=client_org,
        id=cast(int, pm.id),
        body=PartyMembershipUpdateRequest(
            scopes=[AuthScope.READDATA],
        ),
    )
    assert isinstance(e, ErrorMessage)

    e = delete_party_membership.sync(
        client=client_org,
        id=cast(int, pm.id),
        body=EmptyObject(),
    )
    assert isinstance(e, ErrorMessage)


def test_ptym_common(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    for role in sts.COMMON_ROLES:
        client = sts.get_client(TestEntity.TEST, role)
        pty_id = sts.get_userinfo(client)["party_id"]

        # RLS: PTYM-COM001
        # they can read PMs of their own party
        pms_current_party = list_party_membership.sync(
            client=client_fiso, party_id=f"eq.{pty_id}"
        )
        assert isinstance(pms_current_party, list)
        pms = list_party_membership.sync(client=client)
        assert isinstance(pms, list)
        assert len(pms) >= len(pms_current_party)

        # cause some history entries to be created
        pm = pms_current_party[0]

        u = update_party_membership.sync(
            client=client_fiso,
            id=cast(int, pm.id),
            body=PartyMembershipUpdateRequest(
                scopes=[AuthScope.READDATA],
            ),
        )
        assert not (isinstance(u, ErrorMessage))

        u = update_party_membership.sync(
            client=client_fiso,
            id=cast(int, pm.id),
            body=PartyMembershipUpdateRequest(
                scopes=pm.scopes,
            ),
        )
        assert not (isinstance(u, ErrorMessage))

        # RLS: PTYM-COM002
        # and they can read history on them
        # endpoint: GET /party_membership_history
        pmhs = list_party_membership_history.sync(
            client=client,
            party_membership_id=f"eq.{cast(int, pm.id)}",
        )
        assert isinstance(pmhs, list)
        assert len(pmhs) > 0


def test_rla_absence(sts):
    roles_without_rla = ["BRP", "EU", "ES", "MO", "SO", "SP", "TP"]

    for role in roles_without_rla:
        pms = list_party_membership.sync(
            client=sts.get_client(TestEntity.TEST, role),
        )
        assert isinstance(pms, list)
        # PTYM-COM002 gives access to one entry :
        # the current entity being part of the current party
        assert len(pms) == 1
