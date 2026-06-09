from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.geojson_point_crs_type import GeojsonPointCrsType

if TYPE_CHECKING:
    from ..models.geojson_point_crs_properties import GeojsonPointCrsProperties


T = TypeVar("T", bound="GeojsonPointCrs")


@_attrs_define
class GeojsonPointCrs:
    """
    Attributes:
        type_ (GeojsonPointCrsType):
        properties (GeojsonPointCrsProperties):
    """

    type_: GeojsonPointCrsType
    properties: GeojsonPointCrsProperties
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        type_ = self.type_.value

        properties = self.properties.to_dict()

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "type": type_,
                "properties": properties,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.geojson_point_crs_properties import GeojsonPointCrsProperties

        d = dict(src_dict)
        type_ = GeojsonPointCrsType(d.pop("type"))

        properties = GeojsonPointCrsProperties.from_dict(d.pop("properties"))

        geojson_point_crs = cls(
            type_=type_,
            properties=properties,
        )

        geojson_point_crs.additional_properties = d
        return geojson_point_crs

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
