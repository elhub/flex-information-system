from collections.abc import Mapping
from typing import Any, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.controllable_unit_suspension_reason import ControllableUnitSuspensionReason
from ..types import UNSET, Unset

T = TypeVar("T", bound="ControllableUnitSuspension")


@_attrs_define
class ControllableUnitSuspension:
    """Data schema - The relation allowing a system operator to temporarily suspend a controllable unit.

    Attributes:
        reason (Union[Unset, ControllableUnitSuspensionReason]): The reason for the suspension. Example:
            compromises_safe_operation.
        controllable_unit_id (Union[Unset, int]): Reference to the suspended controllable unit. Example: 2.
        impacted_system_operator_id (Union[Unset, int]): Reference to the impacted system operator suspending the
            controllable unit. Example: 7.
        recorded_at (Union[Unset, str]): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31 23:59:00 CET.
        recorded_by (Union[Unset, int]): The identity that recorded the resource. Example: 145.
        id (Union[Unset, int]): Unique surrogate identifier. Example: 74.
    """

    reason: Union[Unset, ControllableUnitSuspensionReason] = UNSET
    controllable_unit_id: Union[Unset, int] = UNSET
    impacted_system_operator_id: Union[Unset, int] = UNSET
    recorded_at: Union[Unset, str] = UNSET
    recorded_by: Union[Unset, int] = UNSET
    id: Union[Unset, int] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        reason: Union[Unset, str] = UNSET
        if not isinstance(self.reason, Unset):
            reason = self.reason.value

        controllable_unit_id = self.controllable_unit_id

        impacted_system_operator_id = self.impacted_system_operator_id

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        id = self.id

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if reason is not UNSET:
            field_dict["reason"] = reason
        if controllable_unit_id is not UNSET:
            field_dict["controllable_unit_id"] = controllable_unit_id
        if impacted_system_operator_id is not UNSET:
            field_dict["impacted_system_operator_id"] = impacted_system_operator_id
        if recorded_at is not UNSET:
            field_dict["recorded_at"] = recorded_at
        if recorded_by is not UNSET:
            field_dict["recorded_by"] = recorded_by
        if id is not UNSET:
            field_dict["id"] = id

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        _reason = d.pop("reason", UNSET)
        reason: Union[Unset, ControllableUnitSuspensionReason]
        if isinstance(_reason, Unset):
            reason = UNSET
        else:
            reason = ControllableUnitSuspensionReason(_reason)

        controllable_unit_id = d.pop("controllable_unit_id", UNSET)

        impacted_system_operator_id = d.pop("impacted_system_operator_id", UNSET)

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        id = d.pop("id", UNSET)

        controllable_unit_suspension = cls(
            reason=reason,
            controllable_unit_id=controllable_unit_id,
            impacted_system_operator_id=impacted_system_operator_id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            id=id,
        )

        controllable_unit_suspension.additional_properties = d
        return controllable_unit_suspension

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
