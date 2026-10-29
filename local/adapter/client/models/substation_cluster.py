from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar
from uuid import UUID

from attrs import define as _attrs_define
from attrs import field as _attrs_field

T = TypeVar("T", bound="SubstationCluster")


@_attrs_define
class SubstationCluster:
    """
    Attributes:
        mrid (UUID):  Example: 11111111-9e32-47b6-aa29-53fedfab1358.
        name (str):  Example: Cluster 1.
        latitude (float):  Example: 59.9139.
        longitude (float):  Example: 10.7522.
    """

    mrid: UUID
    name: str
    latitude: float
    longitude: float
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        mrid = str(self.mrid)

        name = self.name

        latitude = self.latitude

        longitude = self.longitude

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "mrid": mrid,
                "name": name,
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

        latitude = d.pop("latitude")

        longitude = d.pop("longitude")

        substation_cluster = cls(
            mrid=mrid,
            name=name,
            latitude=latitude,
            longitude=longitude,
        )

        substation_cluster.additional_properties = d
        return substation_cluster

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
