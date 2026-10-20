from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

if TYPE_CHECKING:
    from ..models.metering_grid_area_price_area import MeteringGridAreaPriceArea
    from ..models.metering_grid_area_system_operator import (
        MeteringGridAreaSystemOperator,
    )


T = TypeVar("T", bound="MeteringGridArea")


@_attrs_define
class MeteringGridArea:
    """
    Attributes:
        business_id (str): Business ID of the metering grid area. EIC-Y format.
             Example: 10YNO-1--------2.
        name (str): Name of the metering grid area Example: X AREA 2.
        is_active (bool): Whether the MGA is active Example: True.
        system_operator (list[MeteringGridAreaSystemOperator]):  Example: [{'business_id': '2219491247539',
            'valid_from': '2024-01-01T00:00:00+01:00'}].
        price_area (list[MeteringGridAreaPriceArea]):  Example: [{'price_area': 'NO2', 'valid_from':
            '2024-01-01T00:00:00+01:00'}].
    """

    business_id: str
    name: str
    is_active: bool
    system_operator: list[MeteringGridAreaSystemOperator]
    price_area: list[MeteringGridAreaPriceArea]
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        business_id = self.business_id

        name = self.name

        is_active = self.is_active

        system_operator = []
        for system_operator_item_data in self.system_operator:
            system_operator_item = system_operator_item_data.to_dict()
            system_operator.append(system_operator_item)

        price_area = []
        for price_area_item_data in self.price_area:
            price_area_item = price_area_item_data.to_dict()
            price_area.append(price_area_item)

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "business_id": business_id,
                "name": name,
                "is_active": is_active,
                "system_operator": system_operator,
                "price_area": price_area,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.metering_grid_area_price_area import MeteringGridAreaPriceArea  # noqa: PLC0415
        from ..models.metering_grid_area_system_operator import (
            MeteringGridAreaSystemOperator,
        )  # noqa: PLC0415

        d = dict(src_dict)
        business_id = d.pop("business_id")

        name = d.pop("name")

        is_active = d.pop("is_active")

        system_operator = []
        _system_operator = d.pop("system_operator")
        for system_operator_item_data in _system_operator:
            system_operator_item = MeteringGridAreaSystemOperator.from_dict(
                system_operator_item_data
            )

            system_operator.append(system_operator_item)

        price_area = []
        _price_area = d.pop("price_area")
        for price_area_item_data in _price_area:
            price_area_item = MeteringGridAreaPriceArea.from_dict(price_area_item_data)

            price_area.append(price_area_item)

        metering_grid_area = cls(
            business_id=business_id,
            name=name,
            is_active=is_active,
            system_operator=system_operator,
            price_area=price_area,
        )

        metering_grid_area.additional_properties = d
        return metering_grid_area

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
