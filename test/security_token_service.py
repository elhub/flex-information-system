from flex import AuthenticatedClient, Client
from flex.models import (
    AuthScope,
    PartyType,
    PartyRole,
    PartyResponse,
    PartyCreateRequest,
    PartyBusinessIdType,
    PartyMembershipResponse,
    PartyMembershipCreateRequest,
)
from flex.api.party import (
    list_party,
    create_party,
)
from flex.api.party_membership import (
    create_party_membership,
)
from flex.types import UNSET
import os
import requests
from typing import List, cast
from enum import Enum

# debug logging of requests
# https://www.python-httpx.org/logging/
# https://requests.readthedocs.io/en/latest/api/#api-changes
# https://docs.pytest.org/en/stable/how-to/logging.html
import logging
from http.client import HTTPConnection
import random
import string

if os.environ.get("DEBUG") is not None:
    HTTPConnection.debuglevel = 1
    logging.basicConfig(level=logging.DEBUG)
    logging.getLogger().setLevel(logging.DEBUG)
    requests_log = logging.getLogger("urllib3")
    requests_log.setLevel(logging.DEBUG)
    requests_log.propagate = True


def _find_party_id(entity_client, party_name) -> int:
    """
    Find a party id by name
    """
    party = cast(
        List[PartyResponse],
        list_party.sync(
            client=entity_client,
            name=f"ilike.{party_name.replace(' ', '*')}",
            range_unit=UNSET,
            entity_id=UNSET,
        ),
    )[0]

    return cast(int, party.id)


class TestEntity(Enum):
    TEST = "Test"
    COMMON = "Common"
    TEST_ORG = "TestAS"

    # name prefix used to create the parties in the DB
    def party_name_prefix(self):
        match self:
            case TestEntity.TEST:
                return "Test"
            case TestEntity.COMMON:
                return "Common"
            case TestEntity.TEST_ORG:
                return "Test"

    # make pytest ignore this class
    # https://stackoverflow.com/questions/62460557/cannot-collect-test-class-testmain-because-it-has-a-init-constructor-from
    __test__ = False

    def client_id(self):
        match self:
            case TestEntity.TEST:
                return "3733e21b-5def-400d-8133-06bcda02465e"
            case TestEntity.COMMON:
                return "df8bee5f-6e60-4a21-8927-e5bcdd4ce768"
            case TestEntity.TEST_ORG:
                return "eed86ad4-9d5c-4d83-a93a-e7675e13a977"


"""
Helper class for authentication, so we don't repeat this in every test
"""


class SecurityTokenService:
    COMMON_ROLES = ["BRP", "EU", "ES", "FISO", "MO", "SP", "SO", "TP"]
    api_url = os.environ["FLEX_URL_BASE"] + "/api/v0"

    # make this class a singleton so the caches of memoised methods are shared
    def __new__(cls):
        if not hasattr(cls, "instance"):
            cls.instance = super(SecurityTokenService, cls).__new__(cls)
        return cls.instance

    auth_url = os.environ["FLEX_AUTH_BASE"] + "/auth/v0"

    def _client_credentials(self, client_id, client_secret) -> str:
        """
        Get an access token using client credentials
        """
        auth_headers = {"Content-Type": "application/x-www-form-urlencoded"}
        client_credentials_data = {
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret,
        }
        client_credentials_response = requests.post(
            self.auth_url + "/token", headers=auth_headers, data=client_credentials_data
        )
        client_credentials_response.raise_for_status()
        return client_credentials_response.json()["access_token"]

    def _token_exchange(self, entity_token, party_id) -> str:
        """
        Exchange an entity token for a party token
        """
        auth_headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": f"Bearer {entity_token}",
        }
        token_exchange_data = {
            "grant_type": "urn:ietf:params:oauth:grant-type:token-exchange",
            "actor_token_type": "urn:ietf:params:oauth:token-type:jwt",
            "actor_token": entity_token,
            "scope": f"assume:party:{party_id}",
        }
        token_exchange_response = requests.post(
            self.auth_url + "/token", headers=auth_headers, data=token_exchange_data
        )
        token_exchange_response.raise_for_status()
        return token_exchange_response.json()["access_token"]

    # network call to get userinfo
    def _get_userinfo(self, client: AuthenticatedClient) -> dict:
        """
        Get userinfo
        """
        userinfo_response = requests.get(
            self.auth_url + "/userinfo",
            headers={"Authorization": f"Bearer {client.token}"},
        )
        userinfo_response.raise_for_status()
        return userinfo_response.json()

    # memoised method to get userinfo
    _userinfo: dict[str, dict] = {}

    def get_userinfo(self, client: AuthenticatedClient) -> dict:
        if client.token in self._userinfo:
            return self._userinfo[client.token]
        else:
            userinfo = self._get_userinfo(client)
            self._userinfo[client.token] = userinfo
            return userinfo

    # network call for authentication
    def _get_client(self, entity: TestEntity, party_name=None):
        entity_token = self._client_credentials(entity.client_id(), "87h87hijhulO")
        entity_client = AuthenticatedClient(
            base_url=self.api_url, token=entity_token, verify_ssl=False
        )
        if party_name is None or party_name == "ENT":
            return entity_client

        party_id = _find_party_id(
            entity_client,
            f"{str(entity.party_name_prefix())} {party_name}",
        )
        token = self._token_exchange(entity_token, party_id)
        return AuthenticatedClient(base_url=self.api_url, token=token, verify_ssl=False)

    # memoised method for authentication
    _clients: dict[tuple[TestEntity, str | None], AuthenticatedClient] = {}

    def get_client(self, entity=None, party_name=None, reset=False):
        """
        Get an AuthenticatedClient using client credentials.

        If party_name is None, the returned AuthenticatedClient will be an entity.
        If party_name is not None, the returned AuthenticatedClient will be a party.
        """
        if entity is not None:
            if (entity, party_name) in self._clients and not reset:
                return self._clients[(entity, party_name)]
            else:
                client = self._get_client(entity, party_name)
                self._clients[(entity, party_name)] = client
                return client

        # anon
        return Client(base_url=self.api_url, verify_ssl=False)

    _party_types = {
        "BRP": PartyType.BALANCE_RESPONSIBLE_PARTY,
        "EU": PartyType.END_USER,
        "ES": PartyType.ENERGY_SUPPLIER,
        "FISO": PartyType.FLEXIBILITY_INFORMATION_SYSTEM_OPERATOR,
        "MO": PartyType.MARKET_OPERATOR,
        "ORG": PartyType.ORGANISATION,
        "SO": PartyType.SYSTEM_OPERATOR,
        "SP": PartyType.SERVICE_PROVIDER,
        "TP": PartyType.THIRD_PARTY,
    }

    def fresh_client(self, entity, party_name):
        client_fiso = cast(
            AuthenticatedClient, self.get_client(TestEntity.TEST, "FISO")
        )

        party_type = self._party_types[party_name]

        # create a party with the given role and add the given entity to it

        if party_type == PartyType.END_USER:
            business_id_type = UNSET
            business_id = UNSET
        else:
            business_id_type = PartyBusinessIdType.GLN
            base_gln = ["8"] + random.choices(string.digits, k=11)
            check_digit_sum = sum(
                [int(d) * (1 if i % 2 == 0 else 3) for (i, d) in enumerate(base_gln)]
            )
            check_digit = (10 - (check_digit_sum % 10)) % 10
            business_id = "".join(base_gln) + str(check_digit)

        ent_id = self.get_userinfo(
            cast(AuthenticatedClient, self.get_client(entity)),
        )["entity_id"]

        party = create_party.sync(
            client=client_fiso,
            body=PartyCreateRequest(
                role=PartyRole(f"flex_{party_type.value}"),
                type_=party_type,
                name=f"{entity} {party_name} #{
                    ''.join(
                        random.choices(
                            string.ascii_lowercase
                            + string.ascii_uppercase
                            + string.digits,
                            k=6,
                        )
                    )
                }",
                business_id_type=business_id_type,
                business_id=business_id,
                entity_id=ent_id,
            ),
        )
        assert isinstance(party, PartyResponse)

        pm = create_party_membership.sync(
            client=client_fiso,
            body=PartyMembershipCreateRequest(
                party_id=cast(int, party.id),
                entity_id=ent_id,
                scopes=[AuthScope.MANAGEDATA, AuthScope.MANAGEAUTH],
            ),
        )
        assert isinstance(pm, PartyMembershipResponse)

        # now get a client for the new party

        entity_token = self._client_credentials(entity.client_id(), "87h87hijhulO")
        token = self._token_exchange(entity_token, party.id)

        return AuthenticatedClient(
            base_url=self.api_url,
            token=token,
            verify_ssl=False,
        )
