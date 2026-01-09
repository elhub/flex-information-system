from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="AccountingPointMeteringGridArea")


@_attrs_define
class AccountingPointMeteringGridArea:
    """Data schema - Relation telling which metering grid area an accounting point belongs to.

    Attributes:
        accounting_point_id (int | Unset): The ID of the accounting point. Example: 45.
        metering_grid_area_id (int | Unset): The metering grid area of the accounting point. Example: 3.
        valid_from (str | Unset): The date from which the accounting point belongs to the metering grid area. Midnight
            aligned on Norwegian timezone. Example: 2023-09-09 00:00:00 CET.
        valid_to (None | str | Unset): The date until which the accounting point belongs to the metering grid area.
            Midnight aligned on Norwegian timezone.
    """

    accounting_point_id: int | Unset = UNSET
    metering_grid_area_id: int | Unset = UNSET
    valid_from: str | Unset = UNSET
    valid_to: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        accounting_point_id = self.accounting_point_id

        metering_grid_area_id = self.metering_grid_area_id

        valid_from = self.valid_from

        valid_to: None | str | Unset
        if isinstance(self.valid_to, Unset):
            valid_to = UNSET
        else:
            valid_to = self.valid_to

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if accounting_point_id is not UNSET:
            field_dict["accounting_point_id"] = accounting_point_id
        if metering_grid_area_id is not UNSET:
            field_dict["metering_grid_area_id"] = metering_grid_area_id
        if valid_from is not UNSET:
            field_dict["valid_from"] = valid_from
        if valid_to is not UNSET:
            field_dict["valid_to"] = valid_to

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        accounting_point_id = d.pop("accounting_point_id", UNSET)

        metering_grid_area_id = d.pop("metering_grid_area_id", UNSET)

        valid_from = d.pop("valid_from", UNSET)

        def _parse_valid_to(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        valid_to = _parse_valid_to(d.pop("valid_to", UNSET))

        accounting_point_metering_grid_area = cls(
            accounting_point_id=accounting_point_id,
            metering_grid_area_id=metering_grid_area_id,
            valid_from=valid_from,
            valid_to=valid_to,
        )

        accounting_point_metering_grid_area.additional_properties = d
        return accounting_point_metering_grid_area

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
