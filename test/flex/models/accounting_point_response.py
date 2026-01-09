from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

T = TypeVar("T", bound="AccountingPointResponse")


@_attrs_define
class AccountingPointResponse:
    """Data schema - Accounting point for a controllable unit.

    Attributes:
        id (int): Unique surrogate identifier. Example: 89.
        business_id (str): The GSRN metering point id of the accounting point. Example: 709000000000000057.
        system_operator_id (int): The system operator of the accounting point.
        recorded_at (str): When the resource was recorded (created or updated) in the system. Example: 2023-12-31
            23:59:00 CET.
        recorded_by (int): The identity that recorded the resource. Example: 145.
    """

    id: int
    business_id: str
    system_operator_id: int
    recorded_at: str
    recorded_by: int
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        business_id = self.business_id

        system_operator_id = self.system_operator_id

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "business_id": business_id,
                "system_operator_id": system_operator_id,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        business_id = d.pop("business_id")

        system_operator_id = d.pop("system_operator_id")

        recorded_at = d.pop("recorded_at")

        recorded_by = d.pop("recorded_by")

        accounting_point_response = cls(
            id=id,
            business_id=business_id,
            system_operator_id=system_operator_id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
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
