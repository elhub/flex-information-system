from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.auth_scope import AuthScope

T = TypeVar("T", bound="PartyMembershipCreateRequest")


@_attrs_define
class PartyMembershipCreateRequest:
    """Request schema for create operations - The relation between a party and entity.

    Attributes:
        party_id (int): Reference to the party that the membership links to an entity. Example: 379.
        entity_id (int): Reference to the entity that the party represents. Example: 30.
        scopes (list[AuthScope]): List of scopes granted to the entity when it acts as the party. Scopes are inspired
            from OAuth 2.0 and allow refinement of access control and privilege delegation mechanisms. Example:
            ['read:data'].
    """

    party_id: int
    entity_id: int
    scopes: list[AuthScope]
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        party_id = self.party_id

        entity_id = self.entity_id

        scopes = []
        for scopes_item_data in self.scopes:
            scopes_item = scopes_item_data.value
            scopes.append(scopes_item)

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "party_id": party_id,
                "entity_id": entity_id,
                "scopes": scopes,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        party_id = d.pop("party_id")

        entity_id = d.pop("entity_id")

        scopes = []
        _scopes = d.pop("scopes")
        for scopes_item_data in _scopes:
            scopes_item = AuthScope(scopes_item_data)

            scopes.append(scopes_item)

        party_membership_create_request = cls(
            party_id=party_id,
            entity_id=entity_id,
            scopes=scopes,
        )

        party_membership_create_request.additional_properties = d
        return party_membership_create_request

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
