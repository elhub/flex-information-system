from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.party_type import PartyType

T = TypeVar("T", bound="Party")


@_attrs_define
class Party:
    """
    Attributes:
        gln (str): Business ID of the party. GLN format - 13 digits starting with non-zero.
             Example: 7080000100019.
        org (str): Norwegian organisation number of the organisation acting as the party.
             Example: 123456789.
        name (str): Name of the party Example: Acme Energy AS.
        type_ (PartyType): Type of the party
    """

    gln: str
    org: str
    name: str
    type_: PartyType
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        gln = self.gln

        org = self.org

        name = self.name

        type_ = self.type_.value

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "gln": gln,
                "org": org,
                "name": name,
                "type": type_,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        gln = d.pop("gln")

        org = d.pop("org")

        name = d.pop("name")

        type_ = PartyType(d.pop("type"))

        party = cls(
            gln=gln,
            org=org,
            name=name,
            type_=type_,
        )

        party.additional_properties = d
        return party

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
