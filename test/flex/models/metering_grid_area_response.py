from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.metering_grid_area_business_id_type import MeteringGridAreaBusinessIdType

T = TypeVar("T", bound="MeteringGridAreaResponse")


@_attrs_define
class MeteringGridAreaResponse:
    """Response schema - Metering grid area to which accounting points belong.

    Attributes:
        id (int): Unique surrogate identifier. Example: 3.
        business_id (str): The business identifier of the metering grid area. Format depends on `business_id_type`.
            Example: 24YAOER9FNW34FNN.
        business_id_type (MeteringGridAreaBusinessIdType): The type of the business identifier. Example: eic_y.
        name (str): The name of the metering grid area. Example: VN04VESTNORGEDX12.
    """

    id: int
    business_id: str
    business_id_type: MeteringGridAreaBusinessIdType
    name: str
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        business_id = self.business_id

        business_id_type = self.business_id_type.value

        name = self.name

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "business_id": business_id,
                "business_id_type": business_id_type,
                "name": name,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        business_id = d.pop("business_id")

        business_id_type = MeteringGridAreaBusinessIdType(d.pop("business_id_type"))

        name = d.pop("name")

        metering_grid_area_response = cls(
            id=id,
            business_id=business_id,
            business_id_type=business_id_type,
            name=name,
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
