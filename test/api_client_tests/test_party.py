from security_token_service import (
    SecurityTokenService,
    TestEntity,
)
from flex import AuthenticatedClient
from flex.models import (
    PartyResponse,
    PartyHistoryResponse,
    PartyCreateRequest,
    PartyUpdateRequest,
    PartyBusinessIdType,
    ErrorMessage,
)
from flex.api.party import (
    create_party,
    read_party,
    update_party,
    list_party,
    list_party_history,
    read_party_history,
)
from flex.api.party_membership import (
    list_party_membership,
)
import time
from typing import cast
import pytest


def unique_gln() -> str:
    """
    Generate a unique GLN number.

    Returns:
        str: A unique GLN number.
    """
    # Generate a random 11-digit number
    # The leading 7 is there in case the number starts with a 0, which would be removed by
    number = "7" + str(int(time.time_ns()))[-11:]
    # Calculate the check digit
    check_digit = calculate_gln_check_digit(number)
    # Return the full GLN number
    return number + check_digit


def calculate_gln_check_digit(number: str) -> str:
    """
    Calculate the check digit for an GLN number.

    Args:
        number (str): The GLN number without the check digit.

    Returns:
        str: The check digit.
    """
    if not number.isdigit() or len(number) != 12:
        raise ValueError("The input number must be a 12-digit string.")

    total = 0
    for i, digit in enumerate(reversed(number)):
        if i % 2 == 0:
            total += int(digit) * 3
        else:
            total += int(digit)

    check_digit = (10 - (total % 10)) % 10
    return str(check_digit)


def add_eic_check_char(eic: str) -> str:
    """
    Add a check character to an EIC prefix.
    """

    def char_to_code(c):
        if c.isdigit():
            return int(c)
        elif c.isalpha():
            return ord(c) - ord("A") + 10
        elif c == "-":
            return 36
        else:
            raise ValueError(f"Invalid character: {c}")

    def code_to_char(code):
        if 0 <= code <= 9:
            return str(code)
        elif 10 <= code <= 35:
            return chr(code + ord("A") - 10)
        elif code == 36:
            return "-"
        else:
            raise ValueError(f"Invalid code: {code}")

    s = sum([(16 - i) * char_to_code(c) for i, c in enumerate(eic)])
    return eic + code_to_char(36 - ((s - 1) % 37))


@pytest.fixture
def sts():
    yield SecurityTokenService()


# RLS: PTY-FISO001
# RLS: PTY-FISO002
def test_party_fiso(sts):
    client_entity = sts.get_client(TestEntity.TEST)
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    ent_id = sts.get_userinfo(
        cast(AuthenticatedClient, client_entity),
    )["entity_id"]

    # FISO can do everything on parties

    # endpoint: GET /party
    parties = list_party.sync(client=client_fiso)
    assert isinstance(parties, list)

    # endpoint: POST /party
    # can create an end user with a UUID
    p = create_party.sync(
        client=client_fiso,
        body=PartyCreateRequest(
            name="New End User",
            role="flex_end_user",
            type="end_user",
            entity_id=ent_id,
        ),
    )
    assert isinstance(p, PartyResponse)

    # can create something else with an EIC
    p = create_party.sync(
        client=client_fiso,
        body=PartyCreateRequest(
            name="New SP",
            # Using unix timestamp to get a unique value
            business_id=add_eic_check_char(
                f"11X{str(int(time.time_ns()))[-12:]}",
            ),
            business_id_type=PartyBusinessIdType.EIC_X,
            role="flex_service_provider",
            type="service_provider",
            entity_id=ent_id,
        ),
    )
    assert isinstance(p, PartyResponse)

    # can create something else with a GLN
    p = create_party.sync(
        client=client_fiso,
        body=PartyCreateRequest(
            name="New Party",
            business_id=unique_gln(),
            business_id_type=PartyBusinessIdType.GLN,
            role="flex_flexibility_information_system_operator",
            type="flexibility_information_system_operator",
            entity_id=ent_id,
        ),
    )
    assert isinstance(p, PartyResponse)

    # endpoint: PATCH /party/{id}
    u = update_party.sync(
        client=client_fiso,
        id=cast(int, p.id),
        body=PartyUpdateRequest(
            name="New Party UpdateRequestd",
        ),
    )
    assert not (isinstance(u, ErrorMessage))

    # endpoint: GET /party/{id}
    p = read_party.sync(client=client_fiso, id=cast(int, p.id))
    assert isinstance(p, PartyResponse)
    p2 = list_party.sync(client=client_fiso, id=f"eq.{p.id}")
    assert isinstance(p2, list)
    assert len(p2) == 1
    assert p2[0] == p


def test_party_common(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")

    for role in sts.COMMON_ROLES:
        client = sts.get_client(TestEntity.TEST, role)

        # RLS: PTY-COM001
        # can read history on parties they can read
        parties_visible = list_party.sync(
            client=client,
        )
        assert isinstance(parties_visible, list)

        # only checking a few entries is sufficient
        for p in parties_visible[:5]:
            # endpoint: GET /party_history
            hist = list_party_history.sync(
                client=client,
                party_id=f"eq.{p.id}",
            )
            assert isinstance(hist, list)
            assert len(hist) > 0

            # endpoint: GET /party_history/{id}
            h = read_party_history.sync(client=client, id=cast(int, hist[0].id))
            assert isinstance(h, PartyHistoryResponse)

        # RLS: PTY-COM002
        # can read non end user parties
        parties = list_party.sync(
            client=client_fiso,
        )
        assert isinstance(parties, list)
        n_non_end_user_parties = len([p for p in parties if p.type != "end_user"])
        assert len(parties_visible) >= n_non_end_user_parties


# RLS: PTY-ENT001
# RLS: PTY-COM003
def test_party_ent(sts):
    for role in sts.COMMON_ROLES + ["ENT"]:
        client = sts.get_client(TestEntity.TEST, role)
        # can read parties they belong to

        pms_visible = list_party_membership.sync(
            client=client,
        )
        assert isinstance(pms_visible, list)

        # only checking a few entries is sufficient
        for pm in pms_visible[:5]:
            p = read_party.sync(client=client, id=cast(int, pm.party_id))
            assert isinstance(p, PartyResponse)


# RLS: PTY-ENT002
def test_party_ent002(sts):
    client_fiso = sts.get_client(TestEntity.TEST, "FISO")
    client_ent = sts.get_client(TestEntity.TEST, "ENT")
    ent_id = sts.get_userinfo(client_ent)["entity_id"]

    parties_owned_by_ent = list_party.sync(
        client=client_fiso,
        entity_id=f"eq.{ent_id}",
    )
    assert isinstance(parties_owned_by_ent, list)

    for p in parties_owned_by_ent:
        p = read_party.sync(client=client_ent, id=cast(int, p.id))
        assert isinstance(p, PartyResponse)


def test_rla_absence(sts):
    # PTY-COM002 gives access to part of the parties to everybody
    nb_default_visible_parties = len(
        [
            p
            for p in cast(
                list,
                list_party.sync(
                    client=sts.get_client(TestEntity.TEST, "FISO"),
                    limit="10000",
                ),
            )
            if p.type != "end_user"
        ]
    )

    roles_without_rla = ["BRP", "EU", "ES", "MO", "SO", "SP", "TP"]

    for role in roles_without_rla:
        ps = list_party.sync(
            client=sts.get_client(TestEntity.TEST, role),
            limit="10000",
        )
        assert isinstance(ps, list)
        # end user can see one more party because of PTY-COM003 and PTYM-COM002
        if role == "EU":
            assert len(ps) == nb_default_visible_parties + 1
        else:
            assert len(ps) == nb_default_visible_parties
