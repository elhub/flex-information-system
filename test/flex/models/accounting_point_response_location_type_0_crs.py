from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.accounting_point_response_location_type_0_crs_type import AccountingPointResponseLocationType0CrsType
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.accounting_point_response_location_type_0_crs_properties import (
        AccountingPointResponseLocationType0CrsProperties,
    )


T = TypeVar("T", bound="AccountingPointResponseLocationType0Crs")


@_attrs_define
class AccountingPointResponseLocationType0Crs:
    """
    Attributes:
        type_ (AccountingPointResponseLocationType0CrsType | Unset):
        properties (AccountingPointResponseLocationType0CrsProperties | Unset):
    """

    type_: AccountingPointResponseLocationType0CrsType | Unset = UNSET
    properties: AccountingPointResponseLocationType0CrsProperties | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        type_: str | Unset = UNSET
        if not isinstance(self.type_, Unset):
            type_ = self.type_.value

        properties: dict[str, Any] | Unset = UNSET
        if not isinstance(self.properties, Unset):
            properties = self.properties.to_dict()

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if type_ is not UNSET:
            field_dict["type"] = type_
        if properties is not UNSET:
            field_dict["properties"] = properties

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.accounting_point_response_location_type_0_crs_properties import (
            AccountingPointResponseLocationType0CrsProperties,
        )

        d = dict(src_dict)
        _type_ = d.pop("type", UNSET)
        type_: AccountingPointResponseLocationType0CrsType | Unset
        if isinstance(_type_, Unset):
            type_ = UNSET
        else:
            type_ = AccountingPointResponseLocationType0CrsType(_type_)

        _properties = d.pop("properties", UNSET)
        properties: AccountingPointResponseLocationType0CrsProperties | Unset
        if isinstance(_properties, Unset):
            properties = UNSET
        else:
            properties = AccountingPointResponseLocationType0CrsProperties.from_dict(_properties)

        accounting_point_response_location_type_0_crs = cls(
            type_=type_,
            properties=properties,
        )

        accounting_point_response_location_type_0_crs.additional_properties = d
        return accounting_point_response_location_type_0_crs

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
