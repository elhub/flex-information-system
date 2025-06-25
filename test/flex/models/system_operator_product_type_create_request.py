from typing import Any, Dict, List, Type, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.system_operator_product_type_status import SystemOperatorProductTypeStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="SystemOperatorProductTypeCreateRequest")


@_attrs_define
class SystemOperatorProductTypeCreateRequest:
    """Request schema for create operations - Relation between a system operator and a product type they want to buy.

    Attributes:
        status (Union[Unset, SystemOperatorProductTypeStatus]): The status of the relation. Example: active.
        system_operator_id (Union[Unset, int]): Reference to the system operator. Example: 37.
        product_type_id (Union[Unset, int]): Reference to the product type. Example: 8.
    """

    status: Union[Unset, SystemOperatorProductTypeStatus] = UNSET
    system_operator_id: Union[Unset, int] = UNSET
    product_type_id: Union[Unset, int] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        status: Union[Unset, str] = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        system_operator_id = self.system_operator_id

        product_type_id = self.product_type_id

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if status is not UNSET:
            field_dict["status"] = status
        if system_operator_id is not UNSET:
            field_dict["system_operator_id"] = system_operator_id
        if product_type_id is not UNSET:
            field_dict["product_type_id"] = product_type_id

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        _status = d.pop("status", UNSET)
        status: Union[Unset, SystemOperatorProductTypeStatus]
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = SystemOperatorProductTypeStatus(_status)

        system_operator_id = d.pop("system_operator_id", UNSET)

        product_type_id = d.pop("product_type_id", UNSET)

        system_operator_product_type_create_request = cls(
            status=status,
            system_operator_id=system_operator_id,
            product_type_id=product_type_id,
        )

        system_operator_product_type_create_request.additional_properties = d
        return system_operator_product_type_create_request

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
