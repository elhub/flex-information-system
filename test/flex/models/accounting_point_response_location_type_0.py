from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.accounting_point_response_location_type_0_type import AccountingPointResponseLocationType0Type
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.accounting_point_response_location_type_0_crs import AccountingPointResponseLocationType0Crs


T = TypeVar("T", bound="AccountingPointResponseLocationType0")


@_attrs_define
class AccountingPointResponseLocationType0:
    """Geographic location of the accounting point (WGS84), as a GeoJSON point object.

    Example:
        {'type': 'Point', 'crs': {'type': 'name', 'properties': {'name': 'EPSG:4326'}}, 'coordinates': [-2.0259056,
            48.6504504]}

    Attributes:
        type_ (AccountingPointResponseLocationType0Type | Unset):
        crs (AccountingPointResponseLocationType0Crs | Unset):
        coordinates (list[float] | Unset): [longitude, latitude] in decimal degrees (WGS84)
    """

    type_: AccountingPointResponseLocationType0Type | Unset = UNSET
    crs: AccountingPointResponseLocationType0Crs | Unset = UNSET
    coordinates: list[float] | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        type_: str | Unset = UNSET
        if not isinstance(self.type_, Unset):
            type_ = self.type_.value

        crs: dict[str, Any] | Unset = UNSET
        if not isinstance(self.crs, Unset):
            crs = self.crs.to_dict()

        coordinates: list[float] | Unset = UNSET
        if not isinstance(self.coordinates, Unset):
            coordinates = self.coordinates

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if type_ is not UNSET:
            field_dict["type"] = type_
        if crs is not UNSET:
            field_dict["crs"] = crs
        if coordinates is not UNSET:
            field_dict["coordinates"] = coordinates

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.accounting_point_response_location_type_0_crs import AccountingPointResponseLocationType0Crs

        d = dict(src_dict)
        _type_ = d.pop("type", UNSET)
        type_: AccountingPointResponseLocationType0Type | Unset
        if isinstance(_type_, Unset):
            type_ = UNSET
        else:
            type_ = AccountingPointResponseLocationType0Type(_type_)

        _crs = d.pop("crs", UNSET)
        crs: AccountingPointResponseLocationType0Crs | Unset
        if isinstance(_crs, Unset):
            crs = UNSET
        else:
            crs = AccountingPointResponseLocationType0Crs.from_dict(_crs)

        coordinates = cast(list[float], d.pop("coordinates", UNSET))

        accounting_point_response_location_type_0 = cls(
            type_=type_,
            crs=crs,
            coordinates=coordinates,
        )

        accounting_point_response_location_type_0.additional_properties = d
        return accounting_point_response_location_type_0

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
