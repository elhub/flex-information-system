from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar
from uuid import UUID

from attrs import define as _attrs_define
from attrs import field as _attrs_field

T = TypeVar("T", bound="Line")


@_attrs_define
class Line:
    """
    Attributes:
        mrid (UUID):  Example: 22222222-9e32-47b6-aa29-53fedfab1358.
        name (str):  Example: Line 1.
        from_substation_cluster_mrid (UUID):  Example: 11111111-9e32-47b6-aa29-53fedfab1358.
        to_substation_cluster_mrid (UUID):  Example: 33333333-9e32-47b6-aa29-53fedfab1358.
    """

    mrid: UUID
    name: str
    from_substation_cluster_mrid: UUID
    to_substation_cluster_mrid: UUID
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        mrid = str(self.mrid)

        name = self.name

        from_substation_cluster_mrid = str(self.from_substation_cluster_mrid)

        to_substation_cluster_mrid = str(self.to_substation_cluster_mrid)

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "mrid": mrid,
                "name": name,
                "from_substation_cluster_mrid": from_substation_cluster_mrid,
                "to_substation_cluster_mrid": to_substation_cluster_mrid,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        mrid = UUID(d.pop("mrid"))

        name = d.pop("name")

        from_substation_cluster_mrid = UUID(d.pop("from_substation_cluster_mrid"))

        to_substation_cluster_mrid = UUID(d.pop("to_substation_cluster_mrid"))

        line = cls(
            mrid=mrid,
            name=name,
            from_substation_cluster_mrid=from_substation_cluster_mrid,
            to_substation_cluster_mrid=to_substation_cluster_mrid,
        )

        line.additional_properties = d
        return line

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
