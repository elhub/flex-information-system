from typing import Any, Dict, List, Type, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.system_operator_product_type_status import SystemOperatorProductTypeStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="SystemOperatorProductTypeResponse")


@_attrs_define
class SystemOperatorProductTypeResponse:
    """Response schema for operations with return values - Relation between a system operator and a product type they want
    to buy.

        Attributes:
            system_operator_id (int): Reference to the system operator. Example: 37.
            product_type_id (int): Reference to the product type. Example: 8.
            status (Union[Unset, SystemOperatorProductTypeStatus]): The status of the relation. Example: active.
            id (Union[Unset, int]): Unique surrogate identifier. Example: 89.
            recorded_at (Union[Unset, str]): When the resource was recorded (created or updated) in the system. Example:
                2023-12-31 23:59:00 CET.
            recorded_by (Union[Unset, int]): The identity that recorded the resource. Example: 145.
    """

    system_operator_id: int
    product_type_id: int
    status: Union[Unset, SystemOperatorProductTypeStatus] = UNSET
    id: Union[Unset, int] = UNSET
    recorded_at: Union[Unset, str] = UNSET
    recorded_by: Union[Unset, int] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        system_operator_id = self.system_operator_id

        product_type_id = self.product_type_id

        status: Union[Unset, str] = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        id = self.id

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "system_operator_id": system_operator_id,
                "product_type_id": product_type_id,
            }
        )
        if status is not UNSET:
            field_dict["status"] = status
        if id is not UNSET:
            field_dict["id"] = id
        if recorded_at is not UNSET:
            field_dict["recorded_at"] = recorded_at
        if recorded_by is not UNSET:
            field_dict["recorded_by"] = recorded_by

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        system_operator_id = d.pop("system_operator_id")

        product_type_id = d.pop("product_type_id")

        _status = d.pop("status", UNSET)
        status: Union[Unset, SystemOperatorProductTypeStatus]
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = SystemOperatorProductTypeStatus(_status)

        id = d.pop("id", UNSET)

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        system_operator_product_type_response = cls(
            system_operator_id=system_operator_id,
            product_type_id=product_type_id,
            status=status,
            id=id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
        )

        system_operator_product_type_response.additional_properties = d
        return system_operator_product_type_response

    @property
    def additional_keys(self) -> List[str]:
        return list(self.additional_properties.keys())

    def __getitem__(self, key: str) -> Any:
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: Any) -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties
