from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex.models import (
    PartyMembershipResponse,
    PartyMembershipCreateRequest,
    PartyMembershipUpdateRequest,
    PartyMembershipHistoryResponse,
    ErrorMessage,
    EmptyObject,
)
from flex.api.party import (
    list_party,
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
            entity_id=ent_id, party_id=pty_id, scopes=["resources"]
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

    u = update_party_membership.sync(
        client=client_fiso,
        id=cast(int, p.id),
        body=PartyMembershipUpdateRequest(
            scopes=["admin"],
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


def test_ptym_common(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    for role in sts.COMMON_ROLES:
        client = sts.get_client(TestEntity.TEST, role)
        pty_id = sts.get_userinfo(client)["party_id"]

        # RLS: PTYM-COM001
        # check a role can see the history for PTYMs they can see
        visible_ptyms = list_party_membership.sync(client=client)
        assert isinstance(visible_ptyms, list)

        # only checking a few entries is sufficient
        for ptym in visible_ptyms[:5]:
            # endpoint: GET /party_membership_history
            hist = list_party_membership_history.sync(
                client=client,
                party_membership_id=f"eq.{ptym.id}",
            )
            assert isinstance(hist, list)
            assert len(hist) > 0

        # RLS: PTYM-COM002
        pms_current_party = list_party_membership.sync(
            client=client_fiso, party_id=f"eq.{pty_id}"
        )
        assert isinstance(pms_current_party, list)
        pms = list_party_membership.sync(client=client)
        assert isinstance(pms, list)
        assert len(pms) >= len(pms_current_party)

        # RLS: PTYM-COM003
        # is checked by both previous tests:
        # - the role can see history of PTYM they can see
        # - the PTYM they can see are the ones concerning their party


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
