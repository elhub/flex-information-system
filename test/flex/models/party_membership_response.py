from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..models.auth_scope import AuthScope
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.entity_response import EntityResponse
    from ..models.party_response import PartyResponse


T = TypeVar("T", bound="PartyMembershipResponse")


@_attrs_define
class PartyMembershipResponse:
    """Response schema - The relation between a party and entity.

    Attributes:
        id (int): Unique surrogate identifier. Example: 44.
        party_id (int): Reference to the party that the membership links to an entity. Example: 379.
        entity_id (int): Reference to the entity that the party represents. Example: 30.
        scopes (list[AuthScope]): List of scopes granted to the entity when it acts as the party. Scopes are inspired
            from OAuth 2.0 and allow refinement of access control and privilege delegation mechanisms. Example:
            ['read:data'].
        recorded_at (datetime.datetime): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31T23:59:00+00:00.
        recorded_by (int): The identity that recorded the resource. Example: 145.
        party (None | PartyResponse | Unset): Embedded party
        entity (EntityResponse | None | Unset): Embedded entity
    """

    id: int
    party_id: int
    entity_id: int
    scopes: list[AuthScope]
    recorded_at: datetime.datetime
    recorded_by: int
    party: None | PartyResponse | Unset = UNSET
    entity: EntityResponse | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.entity_response import EntityResponse
        from ..models.party_response import PartyResponse

        id = self.id

        party_id = self.party_id

        entity_id = self.entity_id

        scopes = []
        for scopes_item_data in self.scopes:
            scopes_item = scopes_item_data.value
            scopes.append(scopes_item)

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        party: dict[str, Any] | None | Unset
        if isinstance(self.party, Unset):
            party = UNSET
        elif isinstance(self.party, PartyResponse):
            party = self.party.to_dict()
        else:
            party = self.party

        entity: dict[str, Any] | None | Unset
        if isinstance(self.entity, Unset):
            entity = UNSET
        elif isinstance(self.entity, EntityResponse):
            entity = self.entity.to_dict()
        else:
            entity = self.entity

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "party_id": party_id,
                "entity_id": entity_id,
                "scopes": scopes,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
            }
        )
        if party is not UNSET:
            field_dict["party"] = party
        if entity is not UNSET:
            field_dict["entity"] = entity

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.entity_response import EntityResponse
        from ..models.party_response import PartyResponse

        d = dict(src_dict)
        id = d.pop("id")

        party_id = d.pop("party_id")

        entity_id = d.pop("entity_id")

        scopes = []
        _scopes = d.pop("scopes")
        for scopes_item_data in _scopes:
            scopes_item = AuthScope(scopes_item_data)

            scopes.append(scopes_item)

        recorded_at = isoparse(d.pop("recorded_at"))

        recorded_by = d.pop("recorded_by")

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

        def _parse_entity(data: object) -> EntityResponse | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                entity_type_0 = EntityResponse.from_dict(data)

                return entity_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(EntityResponse | None | Unset, data)

        entity = _parse_entity(d.pop("entity", UNSET))

        party_membership_response = cls(
            id=id,
            party_id=party_id,
            entity_id=entity_id,
            scopes=scopes,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            party=party,
            entity=entity,
        )

        party_membership_response.additional_properties = d
        return party_membership_response

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
