from typing import Any, Dict, List, Type, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="AccountingPointResponse")


@_attrs_define
class AccountingPointResponse:
    """Response schema for operations with return values - Accounting point for a controllable unit.

    Attributes:
        business_id (Union[Unset, str]): The GSRN metering point id of the accounting point. Example:
            709000000000000057.
        system_operator_id (Union[Unset, str]): The system operator of the accounting point
        id (Union[Unset, int]): Unique surrogate identifier. Example: 89.
    """

    business_id: Union[Unset, str] = UNSET
    system_operator_id: Union[Unset, str] = UNSET
    id: Union[Unset, int] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        business_id = self.business_id

        system_operator_id = self.system_operator_id

        id = self.id

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if business_id is not UNSET:
            field_dict["business_id"] = business_id
        if system_operator_id is not UNSET:
            field_dict["system_operator_id"] = system_operator_id
        if id is not UNSET:
            field_dict["id"] = id

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        business_id = d.pop("business_id", UNSET)

        system_operator_id = d.pop("system_operator_id", UNSET)

        id = d.pop("id", UNSET)

        accounting_point_response = cls(
            business_id=business_id,
            system_operator_id=system_operator_id,
            id=id,
        )

        accounting_point_response.additional_properties = d
        return accounting_point_response

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
