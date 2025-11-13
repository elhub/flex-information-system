from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.controllable_unit_suspension_reason import ControllableUnitSuspensionReason
from ..types import UNSET, Unset

T = TypeVar("T", bound="ControllableUnitSuspensionHistoryResponse")


@_attrs_define
class ControllableUnitSuspensionHistoryResponse:
    """Controllable Unit Suspension - history

    Attributes:
        controllable_unit_suspension_id (int): Reference to the resource that was updated. Example: 48.
        reason (ControllableUnitSuspensionReason | Unset): The reason for the suspension. Example:
            compromises_safe_operation.
        controllable_unit_id (int | Unset): Reference to the suspended controllable unit. Example: 2.
        impacted_system_operator_id (int | Unset): Reference to the impacted system operator suspending the controllable
            unit. Example: 7.
        recorded_at (str | Unset): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31 23:59:00 CET.
        recorded_by (int | Unset): The identity that recorded the resource. Example: 145.
        id (int | Unset): Unique surrogate identifier. Example: 74.
        replaced_by (int | None | Unset): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (None | str | Unset): When the resource was replaced in the system. Example: 2024-07-07 10:00:00
            CET.
    """

    controllable_unit_suspension_id: int
    reason: ControllableUnitSuspensionReason | Unset = UNSET
    controllable_unit_id: int | Unset = UNSET
    impacted_system_operator_id: int | Unset = UNSET
    recorded_at: str | Unset = UNSET
    recorded_by: int | Unset = UNSET
    id: int | Unset = UNSET
    replaced_by: int | None | Unset = UNSET
    replaced_at: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        controllable_unit_suspension_id = self.controllable_unit_suspension_id

        reason: str | Unset = UNSET
        if not isinstance(self.reason, Unset):
            reason = self.reason.value

        controllable_unit_id = self.controllable_unit_id

        impacted_system_operator_id = self.impacted_system_operator_id

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        id = self.id

        replaced_by: int | None | Unset
        if isinstance(self.replaced_by, Unset):
            replaced_by = UNSET
        else:
            replaced_by = self.replaced_by

        replaced_at: None | str | Unset
        if isinstance(self.replaced_at, Unset):
            replaced_at = UNSET
        else:
            replaced_at = self.replaced_at

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "controllable_unit_suspension_id": controllable_unit_suspension_id,
            }
        )
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
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        controllable_unit_suspension_id = d.pop("controllable_unit_suspension_id")

        _reason = d.pop("reason", UNSET)
        reason: ControllableUnitSuspensionReason | Unset
        if isinstance(_reason, Unset):
            reason = UNSET
        else:
            reason = ControllableUnitSuspensionReason(_reason)

        controllable_unit_id = d.pop("controllable_unit_id", UNSET)

        impacted_system_operator_id = d.pop("impacted_system_operator_id", UNSET)

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        id = d.pop("id", UNSET)

        def _parse_replaced_by(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        replaced_by = _parse_replaced_by(d.pop("replaced_by", UNSET))

        def _parse_replaced_at(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        replaced_at = _parse_replaced_at(d.pop("replaced_at", UNSET))

        controllable_unit_suspension_history_response = cls(
            controllable_unit_suspension_id=controllable_unit_suspension_id,
            reason=reason,
            controllable_unit_id=controllable_unit_id,
            impacted_system_operator_id=impacted_system_operator_id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            id=id,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
        )

        controllable_unit_suspension_history_response.additional_properties = d
        return controllable_unit_suspension_history_response

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
