from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.controllable_unit_suspension_reason import ControllableUnitSuspensionReason
from ..types import UNSET, Unset

T = TypeVar("T", bound="ControllableUnitSuspensionCreateData")


@_attrs_define
class ControllableUnitSuspensionCreateData:
    """Data of the request schema for create operations - The relation allowing an impacted system operator to temporarily
    suspend a controllable unit.

        Attributes:
            reason (ControllableUnitSuspensionReason | Unset): The reason for the suspension. Example:
                compromises_safe_operation.
            controllable_unit_id (int | Unset): Reference to the suspended controllable unit. Example: 2.
            impacted_system_operator_id (int | Unset): Reference to the impacted system operator suspending the controllable
                unit. Example: 7.
    """

    reason: ControllableUnitSuspensionReason | Unset = UNSET
    controllable_unit_id: int | Unset = UNSET
    impacted_system_operator_id: int | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        reason: str | Unset = UNSET
        if not isinstance(self.reason, Unset):
            reason = self.reason.value

        controllable_unit_id = self.controllable_unit_id

        impacted_system_operator_id = self.impacted_system_operator_id

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if reason is not UNSET:
            field_dict["reason"] = reason
        if controllable_unit_id is not UNSET:
            field_dict["controllable_unit_id"] = controllable_unit_id
        if impacted_system_operator_id is not UNSET:
            field_dict["impacted_system_operator_id"] = impacted_system_operator_id

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        _reason = d.pop("reason", UNSET)
        reason: ControllableUnitSuspensionReason | Unset
        if isinstance(_reason, Unset):
            reason = UNSET
        else:
            reason = ControllableUnitSuspensionReason(_reason)

        controllable_unit_id = d.pop("controllable_unit_id", UNSET)

        impacted_system_operator_id = d.pop("impacted_system_operator_id", UNSET)

        controllable_unit_suspension_create_data = cls(
            reason=reason,
            controllable_unit_id=controllable_unit_id,
            impacted_system_operator_id=impacted_system_operator_id,
        )

        controllable_unit_suspension_create_data.additional_properties = d
        return controllable_unit_suspension_create_data

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
