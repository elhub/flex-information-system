from collections.abc import Mapping
from typing import Any, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="AccountingPointResponse")


@_attrs_define
class AccountingPointResponse:
    """Response schema for operations with return values - Accounting point for a controllable unit.

    Attributes:
        recorded_at (Union[Unset, str]): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31 23:59:00 CET.
        recorded_by (Union[Unset, int]): The identity that recorded the resource. Example: 145.
        id (Union[Unset, int]): Unique surrogate identifier. Example: 89.
        business_id (Union[Unset, str]): The GSRN metering point id of the accounting point. Example:
            709000000000000057.
        system_operator_id (Union[Unset, int]): The system operator of the accounting point.
    """

    recorded_at: Union[Unset, str] = UNSET
    recorded_by: Union[Unset, int] = UNSET
    id: Union[Unset, int] = UNSET
    business_id: Union[Unset, str] = UNSET
    system_operator_id: Union[Unset, int] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        id = self.id

        business_id = self.business_id

        system_operator_id = self.system_operator_id

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if recorded_at is not UNSET:
            field_dict["recorded_at"] = recorded_at
        if recorded_by is not UNSET:
            field_dict["recorded_by"] = recorded_by
        if id is not UNSET:
            field_dict["id"] = id
        if business_id is not UNSET:
            field_dict["business_id"] = business_id
        if system_operator_id is not UNSET:
            field_dict["system_operator_id"] = system_operator_id

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        id = d.pop("id", UNSET)

        business_id = d.pop("business_id", UNSET)

        system_operator_id = d.pop("system_operator_id", UNSET)

        accounting_point_response = cls(
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            id=id,
            business_id=business_id,
            system_operator_id=system_operator_id,
        )

        accounting_point_response.additional_properties = d
        return accounting_point_response

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
