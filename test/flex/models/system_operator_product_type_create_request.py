from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.system_operator_product_type_status import SystemOperatorProductTypeStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="SystemOperatorProductTypeCreateRequest")


@_attrs_define
class SystemOperatorProductTypeCreateRequest:
    """Request schema for create operations - Relation between a system operator and a product type they want to buy.

    Attributes:
        system_operator_id (int): Reference to the system operator. Example: 37.
        product_type_id (int): Reference to the product type. Example: 8.
        status (SystemOperatorProductTypeStatus | Unset): The status of the relation. Example: active.
    """

    system_operator_id: int
    product_type_id: int
    status: SystemOperatorProductTypeStatus | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        system_operator_id = self.system_operator_id

        product_type_id = self.product_type_id

        status: str | Unset = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "system_operator_id": system_operator_id,
                "product_type_id": product_type_id,
            }
        )
        if status is not UNSET:
            field_dict["status"] = status

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        system_operator_id = d.pop("system_operator_id")

        product_type_id = d.pop("product_type_id")

        _status = d.pop("status", UNSET)
        status: SystemOperatorProductTypeStatus | Unset
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = SystemOperatorProductTypeStatus(_status)

        system_operator_product_type_create_request = cls(
            system_operator_id=system_operator_id,
            product_type_id=product_type_id,
            status=status,
        )

        system_operator_product_type_create_request.additional_properties = d
        return system_operator_product_type_create_request

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
