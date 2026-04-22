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
            client (EntityClientResponse | None | Unset): Embedded entity_client
            party (None | PartyResponse | Unset): Embedded party
            party_membership (None | PartyMembershipResponse | Unset): Embedded party_membership
            identity (IdentityResponse | None | Unset): Embedded identity
    """

    id: int
    business_id: str
    business_id_type: EntityBusinessIdType
    name: str
    type_: EntityType
    recorded_at: datetime.datetime
    recorded_by: int
    client: EntityClientResponse | None | Unset = UNSET
    party: None | PartyResponse | Unset = UNSET
    party_membership: None | PartyMembershipResponse | Unset = UNSET
    identity: IdentityResponse | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.entity_client_response import EntityClientResponse
        from ..models.identity_response import IdentityResponse
        from ..models.party_membership_response import PartyMembershipResponse
        from ..models.party_response import PartyResponse

        id = self.id

        business_id = self.business_id

        business_id_type = self.business_id_type.value

        name = self.name

        type_ = self.type_.value

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        client: dict[str, Any] | None | Unset
        if isinstance(self.client, Unset):
            client = UNSET
        elif isinstance(self.client, EntityClientResponse):
            client = self.client.to_dict()
        else:
            client = self.client

        party: dict[str, Any] | None | Unset
        if isinstance(self.party, Unset):
            party = UNSET
        elif isinstance(self.party, PartyResponse):
            party = self.party.to_dict()
        else:
            party = self.party

        party_membership: dict[str, Any] | None | Unset
        if isinstance(self.party_membership, Unset):
            party_membership = UNSET
        elif isinstance(self.party_membership, PartyMembershipResponse):
            party_membership = self.party_membership.to_dict()
        else:
            party_membership = self.party_membership

        identity: dict[str, Any] | None | Unset
        if isinstance(self.identity, Unset):
            identity = UNSET
        elif isinstance(self.identity, IdentityResponse):
            identity = self.identity.to_dict()
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

        def _parse_client(data: object) -> EntityClientResponse | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                client_type_0 = EntityClientResponse.from_dict(data)

                return client_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(EntityClientResponse | None | Unset, data)

        client = _parse_client(d.pop("client", UNSET))

        def _parse_party(data: object) -> None | PartyResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                party_type_0 = PartyResponse.from_dict(data)

                return party_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | PartyResponse | Unset, data)

        party = _parse_party(d.pop("party", UNSET))

        def _parse_party_membership(data: object) -> None | PartyMembershipResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                party_membership_type_0 = PartyMembershipResponse.from_dict(data)

                return party_membership_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | PartyMembershipResponse | Unset, data)

        party_membership = _parse_party_membership(d.pop("party_membership", UNSET))

        def _parse_identity(data: object) -> IdentityResponse | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                identity_type_0 = IdentityResponse.from_dict(data)

                return identity_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(IdentityResponse | None | Unset, data)

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
