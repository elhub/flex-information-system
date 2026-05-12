from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.end_user import EndUser
    from ..models.energy_direction import EnergyDirection
    from ..models.energy_supplier import EnergySupplier
    from ..models.metering_grid_area import MeteringGridArea


T = TypeVar("T", bound="AccountingPoint")


@_attrs_define
class AccountingPoint:
    """
    Attributes:
        gsrn (str): Global Service Relation Number (GSRN) - unique identifier for the accounting point Example:
            707057500012345678.
        end_user (list[EndUser]): Time-dependent list of end users associated with this accounting point
        energy_supplier (list[EnergySupplier]): Time-dependent list of energy suppliers associated with this accounting
            point
        metering_grid_area (list[MeteringGridArea]): Time-dependent list of metering grid areas associated with this
            accounting point
        energy_direction (list[EnergyDirection] | Unset): Time-dependent list of energy directions associated with this
            accounting point
    """

    gsrn: str
    end_user: list[EndUser]
    energy_supplier: list[EnergySupplier]
    metering_grid_area: list[MeteringGridArea]
    energy_direction: list[EnergyDirection] | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        gsrn = self.gsrn

        end_user = []
        for end_user_item_data in self.end_user:
            end_user_item = end_user_item_data.to_dict()
            end_user.append(end_user_item)

        energy_supplier = []
        for energy_supplier_item_data in self.energy_supplier:
            energy_supplier_item = energy_supplier_item_data.to_dict()
            energy_supplier.append(energy_supplier_item)

        metering_grid_area = []
        for metering_grid_area_item_data in self.metering_grid_area:
            metering_grid_area_item = metering_grid_area_item_data.to_dict()
            metering_grid_area.append(metering_grid_area_item)

        energy_direction: list[dict[str, Any]] | Unset = UNSET
        if not isinstance(self.energy_direction, Unset):
            energy_direction = []
            for energy_direction_item_data in self.energy_direction:
                energy_direction_item = energy_direction_item_data.to_dict()
                energy_direction.append(energy_direction_item)

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "gsrn": gsrn,
                "end_user": end_user,
                "energy_supplier": energy_supplier,
                "metering_grid_area": metering_grid_area,
            }
        )
        if energy_direction is not UNSET:
            field_dict["energy_direction"] = energy_direction

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.end_user import EndUser
        from ..models.energy_direction import EnergyDirection
        from ..models.energy_supplier import EnergySupplier
        from ..models.metering_grid_area import MeteringGridArea

        d = dict(src_dict)
        gsrn = d.pop("gsrn")

        end_user = []
        _end_user = d.pop("end_user")
        for end_user_item_data in _end_user:
            end_user_item = EndUser.from_dict(end_user_item_data)

            end_user.append(end_user_item)

        energy_supplier = []
        _energy_supplier = d.pop("energy_supplier")
        for energy_supplier_item_data in _energy_supplier:
            energy_supplier_item = EnergySupplier.from_dict(energy_supplier_item_data)

            energy_supplier.append(energy_supplier_item)

        metering_grid_area = []
        _metering_grid_area = d.pop("metering_grid_area")
        for metering_grid_area_item_data in _metering_grid_area:
            metering_grid_area_item = MeteringGridArea.from_dict(
                metering_grid_area_item_data
            )

            metering_grid_area.append(metering_grid_area_item)

        _energy_direction = d.pop("energy_direction", UNSET)
        energy_direction: list[EnergyDirection] | Unset = UNSET
        if _energy_direction is not UNSET:
            energy_direction = []
            for energy_direction_item_data in _energy_direction:
                energy_direction_item = EnergyDirection.from_dict(
                    energy_direction_item_data
                )

                energy_direction.append(energy_direction_item)

        accounting_point = cls(
            gsrn=gsrn,
            end_user=end_user,
            energy_supplier=energy_supplier,
            metering_grid_area=metering_grid_area,
            energy_direction=energy_direction,
        )

        accounting_point.additional_properties = d
        return accounting_point

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
