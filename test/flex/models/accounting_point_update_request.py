from typing import Any, Dict, List, Type, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="AccountingPointUpdateRequest")


@_attrs_define
class AccountingPointUpdateRequest:
    """Request schema for update operations - Accounting point for a controllable unit.

    Attributes:
        business_id (Union[Unset, str]): The GSRN metering point id of the accounting point. Example:
            709000000000000057.
        metering_grid_area_id (Union[Unset, str]): The metering grid area EIC-X id of the accounting point. Example:
            78X-TEST-123456K.
        system_operator_id (Union[Unset, str]): The system operator of the accounting point
    """

    business_id: Union[Unset, str] = UNSET
    metering_grid_area_id: Union[Unset, str] = UNSET
    system_operator_id: Union[Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        business_id = self.business_id

        metering_grid_area_id = self.metering_grid_area_id

        system_operator_id = self.system_operator_id

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if business_id is not UNSET:
            field_dict["business_id"] = business_id
        if metering_grid_area_id is not UNSET:
            field_dict["metering_grid_area_id"] = metering_grid_area_id
        if system_operator_id is not UNSET:
            field_dict["system_operator_id"] = system_operator_id

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        business_id = d.pop("business_id", UNSET)

        metering_grid_area_id = d.pop("metering_grid_area_id", UNSET)

        system_operator_id = d.pop("system_operator_id", UNSET)

        accounting_point_update_request = cls(
            business_id=business_id,
            metering_grid_area_id=metering_grid_area_id,
            system_operator_id=system_operator_id,
        )

        accounting_point_update_request.additional_properties = d
        return accounting_point_update_request

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
