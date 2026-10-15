from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast
from uuid import UUID

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.accounting_point_end_user import AccountingPointEndUser
    from ..models.accounting_point_energy_direction import (
        AccountingPointEnergyDirection,
    )
    from ..models.accounting_point_energy_supplier import AccountingPointEnergySupplier
    from ..models.accounting_point_metering_grid_area import (
        AccountingPointMeteringGridArea,
    )


T = TypeVar("T", bound="AccountingPoint")


@_attrs_define
class AccountingPoint:
    """
    Attributes:
        gsrn (str): Global Service Relation Number (GSRN) - unique identifier for the accounting point Example:
            707057500012345678.
        end_user (list[AccountingPointEndUser]): Time-dependent list of end users associated with this accounting point
        energy_supplier (list[AccountingPointEnergySupplier]): Time-dependent list of energy suppliers associated with
            this accounting point
        metering_grid_area (list[AccountingPointMeteringGridArea]): Time-dependent list of metering grid areas
            associated with this accounting point
        energy_direction (list[AccountingPointEnergyDirection] | Unset): Time-dependent list of energy directions
            associated with this accounting point
        latitude (float | None | Unset): Geographic latitude of the accounting point (WGS84). Example: 59.9139.
        longitude (float | None | Unset): Geographic longitude of the accounting point (WGS84). Example: 10.7522.
        substation (UUID | Unset): Substation this accounting point is related to in the grid model. Example:
            67878d70-9e32-47b6-aa29-53fedfab1358.
    """

    gsrn: str
    end_user: list[AccountingPointEndUser]
    energy_supplier: list[AccountingPointEnergySupplier]
    metering_grid_area: list[AccountingPointMeteringGridArea]
    energy_direction: list[AccountingPointEnergyDirection] | Unset = UNSET
    latitude: float | None | Unset = UNSET
    longitude: float | None | Unset = UNSET
    substation: UUID | Unset = UNSET
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

        latitude: float | None | Unset
        if isinstance(self.latitude, Unset):
            latitude = UNSET
        else:
            latitude = self.latitude

        longitude: float | None | Unset
        if isinstance(self.longitude, Unset):
            longitude = UNSET
        else:
            longitude = self.longitude

        substation: str | Unset = UNSET
        if not isinstance(self.substation, Unset):
            substation = str(self.substation)

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
        if latitude is not UNSET:
            field_dict["latitude"] = latitude
        if longitude is not UNSET:
            field_dict["longitude"] = longitude
        if substation is not UNSET:
            field_dict["substation"] = substation

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.accounting_point_end_user import AccountingPointEndUser  # noqa: PLC0415
        from ..models.accounting_point_energy_direction import (
            AccountingPointEnergyDirection,
        )  # noqa: PLC0415
        from ..models.accounting_point_energy_supplier import (
            AccountingPointEnergySupplier,
        )  # noqa: PLC0415
        from ..models.accounting_point_metering_grid_area import (
            AccountingPointMeteringGridArea,
        )  # noqa: PLC0415

        d = dict(src_dict)
        gsrn = d.pop("gsrn")

        end_user = []
        _end_user = d.pop("end_user")
        for end_user_item_data in _end_user:
            end_user_item = AccountingPointEndUser.from_dict(end_user_item_data)

            end_user.append(end_user_item)

        energy_supplier = []
        _energy_supplier = d.pop("energy_supplier")
        for energy_supplier_item_data in _energy_supplier:
            energy_supplier_item = AccountingPointEnergySupplier.from_dict(
                energy_supplier_item_data
            )

            energy_supplier.append(energy_supplier_item)

        metering_grid_area = []
        _metering_grid_area = d.pop("metering_grid_area")
        for metering_grid_area_item_data in _metering_grid_area:
            metering_grid_area_item = AccountingPointMeteringGridArea.from_dict(
                metering_grid_area_item_data
            )

            metering_grid_area.append(metering_grid_area_item)

        _energy_direction = d.pop("energy_direction", UNSET)
        energy_direction: list[AccountingPointEnergyDirection] | Unset = UNSET
        if _energy_direction is not UNSET:
            energy_direction = []
            for energy_direction_item_data in _energy_direction:
                energy_direction_item = AccountingPointEnergyDirection.from_dict(
                    energy_direction_item_data
                )

                energy_direction.append(energy_direction_item)

        def _parse_latitude(data: object) -> float | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(float | None | Unset, data)

        latitude = _parse_latitude(d.pop("latitude", UNSET))

        def _parse_longitude(data: object) -> float | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(float | None | Unset, data)

        longitude = _parse_longitude(d.pop("longitude", UNSET))

        _substation = d.pop("substation", UNSET)
        substation: UUID | Unset
        if isinstance(_substation, Unset):
            substation = UNSET
        else:
            substation = UUID(_substation)

        accounting_point = cls(
            gsrn=gsrn,
            end_user=end_user,
            energy_supplier=energy_supplier,
            metering_grid_area=metering_grid_area,
            energy_direction=energy_direction,
            latitude=latitude,
            longitude=longitude,
            substation=substation,
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
