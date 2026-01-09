from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.auth_scope import AuthScope
from ..types import UNSET, Unset

T = TypeVar("T", bound="PartyMembershipHistory")


@_attrs_define
class PartyMembershipHistory:
    """Party Membership - history

    Attributes:
        id (int): Unique surrogate identifier. Example: 44.
        party_id (int): Reference to the party that the membership links to an entity. Example: 379.
        entity_id (int): Reference to the entity that the party represents. Example: 30.
        scopes (list[AuthScope]): List of scopes granted to the entity when it acts as the party. Scopes are inspired
            from OAuth 2.0 and allow refinement of access control and privilege delegation mechanisms. Example:
            ['read:data'].
        recorded_at (str): When the resource was recorded (created or updated) in the system. Example: 2023-12-31
            23:59:00 CET.
        recorded_by (int): The identity that recorded the resource. Example: 145.
        party_membership_id (int): Reference to the resource that was updated. Example: 48.
        replaced_by (int | None | Unset): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (None | str | Unset): When the resource was replaced in the system. Example: 2024-07-07 10:00:00
            CET.
    """

    id: int
    party_id: int
    entity_id: int
    scopes: list[AuthScope]
    recorded_at: str
    recorded_by: int
    party_membership_id: int
    replaced_by: int | None | Unset = UNSET
    replaced_at: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        party_id = self.party_id

        entity_id = self.entity_id

        scopes = []
        for scopes_item_data in self.scopes:
            scopes_item = scopes_item_data.value
            scopes.append(scopes_item)

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        party_membership_id = self.party_membership_id

        replaced_by: int | None | Unset
        if isinstance(self.replaced_by, Unset):
            replaced_by = UNSET
        else:
            replaced_by = self.replaced_by

        replaced_at: None | str | Unset
        if isinstance(self.replaced_at, Unset):
            replaced_at = UNSET
        else:
            replaced_at = self.replaced_at

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
                "party_membership_id": party_membership_id,
            }
        )
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        party_id = d.pop("party_id")

        entity_id = d.pop("entity_id")

        scopes = []
        _scopes = d.pop("scopes")
        for scopes_item_data in _scopes:
            scopes_item = AuthScope(scopes_item_data)

            scopes.append(scopes_item)

        recorded_at = d.pop("recorded_at")

        recorded_by = d.pop("recorded_by")

        party_membership_id = d.pop("party_membership_id")

        def _parse_replaced_by(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        replaced_by = _parse_replaced_by(d.pop("replaced_by", UNSET))

        def _parse_replaced_at(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        replaced_at = _parse_replaced_at(d.pop("replaced_at", UNSET))

        party_membership_history = cls(
            id=id,
            party_id=party_id,
            entity_id=entity_id,
            scopes=scopes,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            party_membership_id=party_membership_id,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
        )

        party_membership_history.additional_properties = d
        return party_membership_history

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
