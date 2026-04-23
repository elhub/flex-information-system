from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..models.entity_business_id_type import EntityBusinessIdType
from ..models.entity_type import EntityType
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.entity_client_response import EntityClientResponse
    from ..models.identity_response import IdentityResponse
    from ..models.party_membership_response import PartyMembershipResponse
    from ..models.party_response import PartyResponse


T = TypeVar("T", bound="EntityResponse")


@_attrs_define
class EntityResponse:
    """Response schema - Entity - Natural or legal person

    An entity is a natural or legal person that can be a party in the Flexibility Information System.

    Example entity types:

    * Person
    * Organisation

        Attributes:
            id (int): Unique surrogate identifier.

                Note:
                This is a Primary Key. Example: 14.
            business_id (str): The business identifier of the entity. Format depends on `business_id_type`. Example:
                13370000000.
            business_id_type (EntityBusinessIdType): The type of the business identifier. Example: pid.
            name (str): Name of the entity. Maximum 128 characters. Example: John Smith.
            type_ (EntityType): The type of the entity, e.g Person, Organisation Example: person.
            recorded_at (datetime.datetime): When the resource was recorded (created or updated) in the system. Example:
                2023-12-31T23:59:00+00:00.
            recorded_by (int): The identity that recorded the resource. Example: 145.
            client (list[EntityClientResponse] | None | Unset): Embedded entity_client
            party (list[PartyResponse] | None | Unset): Embedded party
            party_membership (list[PartyMembershipResponse] | None | Unset): Embedded party_membership
            identity (list[IdentityResponse] | None | Unset): Embedded identity
    """

    id: int
    business_id: str
    business_id_type: EntityBusinessIdType
    name: str
    type_: EntityType
    recorded_at: datetime.datetime
    recorded_by: int
    client: list[EntityClientResponse] | None | Unset = UNSET
    party: list[PartyResponse] | None | Unset = UNSET
    party_membership: list[PartyMembershipResponse] | None | Unset = UNSET
    identity: list[IdentityResponse] | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        business_id = self.business_id

        business_id_type = self.business_id_type.value

        name = self.name

        type_ = self.type_.value

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        client: list[dict[str, Any]] | None | Unset
        if isinstance(self.client, Unset):
            client = UNSET
        elif isinstance(self.client, list):
            client = []
            for client_type_0_item_data in self.client:
                client_type_0_item = client_type_0_item_data.to_dict()
                client.append(client_type_0_item)

        else:
            client = self.client

        party: list[dict[str, Any]] | None | Unset
        if isinstance(self.party, Unset):
            party = UNSET
        elif isinstance(self.party, list):
            party = []
            for party_type_0_item_data in self.party:
                party_type_0_item = party_type_0_item_data.to_dict()
                party.append(party_type_0_item)

        else:
            party = self.party

        party_membership: list[dict[str, Any]] | None | Unset
        if isinstance(self.party_membership, Unset):
            party_membership = UNSET
        elif isinstance(self.party_membership, list):
            party_membership = []
            for party_membership_type_0_item_data in self.party_membership:
                party_membership_type_0_item = party_membership_type_0_item_data.to_dict()
                party_membership.append(party_membership_type_0_item)

        else:
            party_membership = self.party_membership

        identity: list[dict[str, Any]] | None | Unset
        if isinstance(self.identity, Unset):
            identity = UNSET
        elif isinstance(self.identity, list):
            identity = []
            for identity_type_0_item_data in self.identity:
                identity_type_0_item = identity_type_0_item_data.to_dict()
                identity.append(identity_type_0_item)

        else:
            identity = self.identity

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "business_id": business_id,
                "business_id_type": business_id_type,
                "name": name,
                "type": type_,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
            }
        )
        if client is not UNSET:
            field_dict["client"] = client
        if party is not UNSET:
            field_dict["party"] = party
        if party_membership is not UNSET:
            field_dict["party_membership"] = party_membership
        if identity is not UNSET:
            field_dict["identity"] = identity

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.entity_client_response import EntityClientResponse
        from ..models.identity_response import IdentityResponse
        from ..models.party_membership_response import PartyMembershipResponse
        from ..models.party_response import PartyResponse

        d = dict(src_dict)
        id = d.pop("id")

        business_id = d.pop("business_id")

        business_id_type = EntityBusinessIdType(d.pop("business_id_type"))

        name = d.pop("name")

        type_ = EntityType(d.pop("type"))

        recorded_at = isoparse(d.pop("recorded_at"))

        recorded_by = d.pop("recorded_by")

        def _parse_client(data: object) -> list[EntityClientResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                client_type_0 = []
                _client_type_0 = data
                for client_type_0_item_data in _client_type_0:
                    client_type_0_item = EntityClientResponse.from_dict(client_type_0_item_data)

                    client_type_0.append(client_type_0_item)

                return client_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[EntityClientResponse] | None | Unset, data)

        client = _parse_client(d.pop("client", UNSET))

        def _parse_party(data: object) -> list[PartyResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                party_type_0 = []
                _party_type_0 = data
                for party_type_0_item_data in _party_type_0:
                    party_type_0_item = PartyResponse.from_dict(party_type_0_item_data)

                    party_type_0.append(party_type_0_item)

                return party_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[PartyResponse] | None | Unset, data)

        party = _parse_party(d.pop("party", UNSET))

        def _parse_party_membership(data: object) -> list[PartyMembershipResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                party_membership_type_0 = []
                _party_membership_type_0 = data
                for party_membership_type_0_item_data in _party_membership_type_0:
                    party_membership_type_0_item = PartyMembershipResponse.from_dict(party_membership_type_0_item_data)

                    party_membership_type_0.append(party_membership_type_0_item)

                return party_membership_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[PartyMembershipResponse] | None | Unset, data)

        party_membership = _parse_party_membership(d.pop("party_membership", UNSET))

        def _parse_identity(data: object) -> list[IdentityResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                identity_type_0 = []
                _identity_type_0 = data
                for identity_type_0_item_data in _identity_type_0:
                    identity_type_0_item = IdentityResponse.from_dict(identity_type_0_item_data)

                    identity_type_0.append(identity_type_0_item)

                return identity_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[IdentityResponse] | None | Unset, data)

        identity = _parse_identity(d.pop("identity", UNSET))

        entity_response = cls(
            id=id,
            business_id=business_id,
            business_id_type=business_id_type,
            name=name,
            type_=type_,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            client=client,
            party=party,
            party_membership=party_membership,
            identity=identity,
        )

        entity_response.additional_properties = d
        return entity_response

    @property
    def additional_keys(self) -> list[str]:
        return list(self.additional_properties.keys())

    def __getitem__(self, key: str) -> Any:
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: Any) -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties
