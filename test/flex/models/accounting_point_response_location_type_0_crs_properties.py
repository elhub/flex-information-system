from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.accounting_point_response_location_type_0_crs_properties_name import (
    AccountingPointResponseLocationType0CrsPropertiesName,
)
from ..types import UNSET, Unset

T = TypeVar("T", bound="AccountingPointResponseLocationType0CrsProperties")


@_attrs_define
class AccountingPointResponseLocationType0CrsProperties:
    """
    Attributes:
        name (AccountingPointResponseLocationType0CrsPropertiesName | Unset):
    """

    name: AccountingPointResponseLocationType0CrsPropertiesName | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        name: str | Unset = UNSET
        if not isinstance(self.name, Unset):
            name = self.name.value

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if name is not UNSET:
            field_dict["name"] = name

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        _name = d.pop("name", UNSET)
        name: AccountingPointResponseLocationType0CrsPropertiesName | Unset
        if isinstance(_name, Unset):
            name = UNSET
        else:
            name = AccountingPointResponseLocationType0CrsPropertiesName(_name)

        accounting_point_response_location_type_0_crs_properties = cls(
            name=name,
        )

        accounting_point_response_location_type_0_crs_properties.additional_properties = d
        return accounting_point_response_location_type_0_crs_properties

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
