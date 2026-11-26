from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast
from uuid import UUID

from attrs import define as _attrs_define
from attrs import field as _attrs_field

T = TypeVar("T", bound="Substation")


@_attrs_define
class Substation:
    """
    Attributes:
        mrid (UUID):  Example: 67878d70-9e32-47b6-aa29-53fedfab1358.
        name (str):  Example: Substation 1.
        kind (str): Kind of substation, as given by the grid model source. Example: distribution.
        primary_concessionaire (str): Name and organisation number of the primary concessionaire.
             Example: Grid Company AS (123456789).
        substation_cluster_mrid (UUID):  Example: 11111111-9e32-47b6-aa29-53fedfab1358.
        voltage_levels (list[float]): Nominal voltages of the substation. Example: [22000.0, 400.0].
        latitude (float):  Example: 59.9139.
        longitude (float):  Example: 10.7522.
    """

    mrid: UUID
    name: str
    kind: str
    primary_concessionaire: str
    substation_cluster_mrid: UUID
    voltage_levels: list[float]
    latitude: float
    longitude: float
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        mrid = str(self.mrid)

        name = self.name

        kind = self.kind

        primary_concessionaire = self.primary_concessionaire

        substation_cluster_mrid = str(self.substation_cluster_mrid)

        voltage_levels = self.voltage_levels

        latitude = self.latitude

        longitude = self.longitude

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "mrid": mrid,
                "name": name,
                "kind": kind,
                "primary_concessionaire": primary_concessionaire,
                "substation_cluster_mrid": substation_cluster_mrid,
                "voltage_levels": voltage_levels,
                "latitude": latitude,
                "longitude": longitude,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        mrid = UUID(d.pop("mrid"))

        name = d.pop("name")

        kind = d.pop("kind")

        primary_concessionaire = d.pop("primary_concessionaire")

        substation_cluster_mrid = UUID(d.pop("substation_cluster_mrid"))

        voltage_levels = cast(list[float], d.pop("voltage_levels"))

        latitude = d.pop("latitude")

        longitude = d.pop("longitude")

        substation = cls(
            mrid=mrid,
            name=name,
            kind=kind,
            primary_concessionaire=primary_concessionaire,
            substation_cluster_mrid=substation_cluster_mrid,
            voltage_levels=voltage_levels,
            latitude=latitude,
            longitude=longitude,
        )

        substation.additional_properties = d
        return substation

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
