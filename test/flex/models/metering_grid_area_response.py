from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.metering_grid_area_price_area import MeteringGridAreaPriceArea
from ..types import UNSET, Unset

T = TypeVar("T", bound="MeteringGridAreaResponse")


@_attrs_define
class MeteringGridAreaResponse:
    """Response schema - Metering grid area to which accounting points belong.

    Attributes:
        id (int): Unique surrogate identifier. Example: 3.
        business_id (str): The EIC-Y code for this metering grid area. Example: 24YAOER9FNW34FNN.
        name (str): The name of the metering grid area. Example: VN04VESTNORGEDX12.
        price_area (MeteringGridAreaPriceArea): The price area of the metering grid area. Example: NO3.
        system_operator_id (int): The system operator responsible for the metering grid area.
        valid_from (str): The date from which the metering grid area is active. Midnight aligned on Norwegian timezone.
            Example: 2023-09-09 00:00:00 CET.
        recorded_at (str): When the resource was recorded (created or updated) in the system. Example: 2023-12-31
            23:59:00 CET.
        recorded_by (int): The identity that recorded the resource. Example: 145.
        valid_to (None | str | Unset): The date until which the metering grid area is active. Midnight aligned on
            Norwegian timezone.
    """

    id: int
    business_id: str
    name: str
    price_area: MeteringGridAreaPriceArea
    system_operator_id: int
    valid_from: str
    recorded_at: str
    recorded_by: int
    valid_to: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        business_id = self.business_id

        name = self.name

        price_area = self.price_area.value

        system_operator_id = self.system_operator_id

        valid_from = self.valid_from

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        valid_to: None | str | Unset
        if isinstance(self.valid_to, Unset):
            valid_to = UNSET
        else:
            valid_to = self.valid_to

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "business_id": business_id,
                "name": name,
                "price_area": price_area,
                "system_operator_id": system_operator_id,
                "valid_from": valid_from,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
            }
        )
        if valid_to is not UNSET:
            field_dict["valid_to"] = valid_to

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        business_id = d.pop("business_id")

        name = d.pop("name")

        price_area = MeteringGridAreaPriceArea(d.pop("price_area"))

        system_operator_id = d.pop("system_operator_id")

        valid_from = d.pop("valid_from")

        recorded_at = d.pop("recorded_at")

        recorded_by = d.pop("recorded_by")

        def _parse_valid_to(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        valid_to = _parse_valid_to(d.pop("valid_to", UNSET))

        metering_grid_area_response = cls(
            id=id,
            business_id=business_id,
            name=name,
            price_area=price_area,
            system_operator_id=system_operator_id,
            valid_from=valid_from,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            valid_to=valid_to,
        )

        metering_grid_area_response.additional_properties = d
        return metering_grid_area_response

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
