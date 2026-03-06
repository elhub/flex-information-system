from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..models.controllable_unit_suspension_reason import ControllableUnitSuspensionReason

T = TypeVar("T", bound="ControllableUnitSuspensionResponse")


@_attrs_define
class ControllableUnitSuspensionResponse:
    """Response schema - The relation allowing an impacted system operator to temporarily suspend a controllable unit.

    Attributes:
        id (int): Unique surrogate identifier. Example: 74.
        controllable_unit_id (int): Reference to the suspended controllable unit. Example: 2.
        impacted_system_operator_id (int): Reference to the impacted system operator suspending the controllable unit.
            Example: 7.
        reason (ControllableUnitSuspensionReason): The reason for the suspension. Example: compromises_safe_operation.
        recorded_at (datetime.datetime): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31T23:59:00+00:00.
        recorded_by (int): The identity that recorded the resource. Example: 145.
    """

    id: int
    controllable_unit_id: int
    impacted_system_operator_id: int
    reason: ControllableUnitSuspensionReason
    recorded_at: datetime.datetime
    recorded_by: int
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        controllable_unit_id = self.controllable_unit_id

        impacted_system_operator_id = self.impacted_system_operator_id

        reason = self.reason.value

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "controllable_unit_id": controllable_unit_id,
                "impacted_system_operator_id": impacted_system_operator_id,
                "reason": reason,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        controllable_unit_id = d.pop("controllable_unit_id")

        impacted_system_operator_id = d.pop("impacted_system_operator_id")

        reason = ControllableUnitSuspensionReason(d.pop("reason"))

        recorded_at = isoparse(d.pop("recorded_at"))

        recorded_by = d.pop("recorded_by")

        controllable_unit_suspension_response = cls(
            id=id,
            controllable_unit_id=controllable_unit_id,
            impacted_system_operator_id=impacted_system_operator_id,
            reason=reason,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
        )

        controllable_unit_suspension_response.additional_properties = d
        return controllable_unit_suspension_response

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
