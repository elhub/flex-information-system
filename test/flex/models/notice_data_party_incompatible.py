from __future__ import annotations

from collections.abc import Mapping
from typing import Any, Literal, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="NoticeDataPartyIncompatible")


@_attrs_define
class NoticeDataPartyIncompatible:
    """Format of the data field in a notice with data.kind = notice.data.party.incompatible

    Attributes:
        kind (Literal['notice.data.party.incompatible']): Identifies the notice data schema for discriminated union
            deserialization.
        entity (int | Unset): ID of the entity with access to incompatible parties. Example: 7.
        party_groups (list[list[int]] | Unset): Groups of parties the entity owns or is a member of. Each item is the
            list of IDs of the parties in one group. Parties from different groups are incompatible with each other.
    """

    kind: Literal["notice.data.party.incompatible"]
    entity: int | Unset = UNSET
    party_groups: list[list[int]] | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        kind = self.kind

        entity = self.entity

        party_groups: list[list[int]] | Unset = UNSET
        if not isinstance(self.party_groups, Unset):
            party_groups = []
            for party_groups_item_data in self.party_groups:
                party_groups_item = party_groups_item_data

                party_groups.append(party_groups_item)

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "kind": kind,
            }
        )
        if entity is not UNSET:
            field_dict["entity"] = entity
        if party_groups is not UNSET:
            field_dict["party_groups"] = party_groups

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        kind = cast(Literal["notice.data.party.incompatible"], d.pop("kind"))
        if kind != "notice.data.party.incompatible":
            raise ValueError(f"kind must match const 'notice.data.party.incompatible', got '{kind}'")

        entity = d.pop("entity", UNSET)

        _party_groups = d.pop("party_groups", UNSET)
        party_groups: list[list[int]] | Unset = UNSET
        if _party_groups is not UNSET:
            party_groups = []
            for party_groups_item_data in _party_groups:
                party_groups_item = cast(list[int], party_groups_item_data)

                party_groups.append(party_groups_item)

        notice_data_party_incompatible = cls(
            kind=kind,
            entity=entity,
            party_groups=party_groups,
        )

        notice_data_party_incompatible.additional_properties = d
        return notice_data_party_incompatible

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
