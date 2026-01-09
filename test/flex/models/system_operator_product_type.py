from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.system_operator_product_type_status import SystemOperatorProductTypeStatus

T = TypeVar("T", bound="SystemOperatorProductType")


@_attrs_define
class SystemOperatorProductType:
    """Data schema - Relation between a system operator and a product type they want to buy.

    Attributes:
        id (int): Unique surrogate identifier. Example: 89.
        system_operator_id (int): Reference to the system operator. Example: 37.
        product_type_id (int): Reference to the product type. Example: 8.
        status (SystemOperatorProductTypeStatus): The status of the relation. Example: active.
        recorded_at (str): When the resource was recorded (created or updated) in the system. Example: 2023-12-31
            23:59:00 CET.
        recorded_by (int): The identity that recorded the resource. Example: 145.
    """

    id: int
    system_operator_id: int
    product_type_id: int
    status: SystemOperatorProductTypeStatus
    recorded_at: str
    recorded_by: int
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        system_operator_id = self.system_operator_id

        product_type_id = self.product_type_id

        status = self.status.value

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "system_operator_id": system_operator_id,
                "product_type_id": product_type_id,
                "status": status,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        system_operator_id = d.pop("system_operator_id")

        product_type_id = d.pop("product_type_id")

        status = SystemOperatorProductTypeStatus(d.pop("status"))

        recorded_at = d.pop("recorded_at")

        recorded_by = d.pop("recorded_by")

        system_operator_product_type = cls(
            id=id,
            system_operator_id=system_operator_id,
            product_type_id=product_type_id,
            status=status,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
        )

        system_operator_product_type.additional_properties = d
        return system_operator_product_type

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
