from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.controllable_unit_suspension_reason import ControllableUnitSuspensionReason
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.controllable_unit_history_response import ControllableUnitHistoryResponse
    from ..models.controllable_unit_suspension_comment_history_response import (
        ControllableUnitSuspensionCommentHistoryResponse,
    )
    from ..models.party_history_response import PartyHistoryResponse


T = TypeVar("T", bound="ControllableUnitSuspensionHistoryResponse")


@_attrs_define
class ControllableUnitSuspensionHistoryResponse:
    """Controllable Unit Suspension - history

    Attributes:
        id (int): Unique surrogate identifier. Example: 74.
        controllable_unit_id (int): Reference to the suspended controllable unit. Example: 2.
        impacted_system_operator_id (int): Reference to the impacted system operator suspending the controllable unit.
            Example: 7.
        reason (ControllableUnitSuspensionReason): The reason for the suspension. Example: compromises_safe_operation.
        recorded_at (datetime.datetime): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31T23:59:00+00:00.
        recorded_by (int): The identity that recorded the resource. Example: 145.
        controllable_unit_suspension_id (int): Reference to the resource that was updated. Example: 48.
        replaced_by (int | None | Unset): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (datetime.datetime | None | Unset): When the resource was replaced in the system. Example:
            2024-07-07T10:00:00+00:00.
        controllable_unit_history (list[ControllableUnitHistoryResponse] | None | Unset): Embedded
            controllable_unit_history
        impacted_system_operator_history (list[PartyHistoryResponse] | None | Unset): Embedded party_history
        comment_history (list[ControllableUnitSuspensionCommentHistoryResponse] | None | Unset): Embedded
            controllable_unit_suspension_comment_history
    """

    id: int
    controllable_unit_id: int
    impacted_system_operator_id: int
    reason: ControllableUnitSuspensionReason
    recorded_at: datetime.datetime
    recorded_by: int
    controllable_unit_suspension_id: int
    replaced_by: int | None | Unset = UNSET
    replaced_at: datetime.datetime | None | Unset = UNSET
    controllable_unit_history: list[ControllableUnitHistoryResponse] | None | Unset = UNSET
    impacted_system_operator_history: list[PartyHistoryResponse] | None | Unset = UNSET
    comment_history: list[ControllableUnitSuspensionCommentHistoryResponse] | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        controllable_unit_id = self.controllable_unit_id

        impacted_system_operator_id = self.impacted_system_operator_id

        reason = self.reason.value

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        controllable_unit_suspension_id = self.controllable_unit_suspension_id

        replaced_by: int | None | Unset
        if isinstance(self.replaced_by, Unset):
            replaced_by = UNSET
        else:
            replaced_by = self.replaced_by

        replaced_at: None | str | Unset
        if isinstance(self.replaced_at, Unset):
            replaced_at = UNSET
        elif isinstance(self.replaced_at, datetime.datetime):
            replaced_at = self.replaced_at.isoformat()
        else:
            replaced_at = self.replaced_at

        controllable_unit_history: list[dict[str, Any]] | None | Unset
        if isinstance(self.controllable_unit_history, Unset):
            controllable_unit_history = UNSET
        elif isinstance(self.controllable_unit_history, list):
            controllable_unit_history = []
            for controllable_unit_history_type_0_item_data in self.controllable_unit_history:
                controllable_unit_history_type_0_item = controllable_unit_history_type_0_item_data.to_dict()
                controllable_unit_history.append(controllable_unit_history_type_0_item)

        else:
            controllable_unit_history = self.controllable_unit_history

        impacted_system_operator_history: list[dict[str, Any]] | None | Unset
        if isinstance(self.impacted_system_operator_history, Unset):
            impacted_system_operator_history = UNSET
        elif isinstance(self.impacted_system_operator_history, list):
            impacted_system_operator_history = []
            for impacted_system_operator_history_type_0_item_data in self.impacted_system_operator_history:
                impacted_system_operator_history_type_0_item = (
                    impacted_system_operator_history_type_0_item_data.to_dict()
                )
                impacted_system_operator_history.append(impacted_system_operator_history_type_0_item)

        else:
            impacted_system_operator_history = self.impacted_system_operator_history

        comment_history: list[dict[str, Any]] | None | Unset
        if isinstance(self.comment_history, Unset):
            comment_history = UNSET
        elif isinstance(self.comment_history, list):
            comment_history = []
            for comment_history_type_0_item_data in self.comment_history:
                comment_history_type_0_item = comment_history_type_0_item_data.to_dict()
                comment_history.append(comment_history_type_0_item)

        else:
            comment_history = self.comment_history

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
                "controllable_unit_suspension_id": controllable_unit_suspension_id,
            }
        )
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at
        if controllable_unit_history is not UNSET:
            field_dict["controllable_unit_history"] = controllable_unit_history
        if impacted_system_operator_history is not UNSET:
            field_dict["impacted_system_operator_history"] = impacted_system_operator_history
        if comment_history is not UNSET:
            field_dict["comment_history"] = comment_history

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.controllable_unit_history_response import ControllableUnitHistoryResponse
        from ..models.controllable_unit_suspension_comment_history_response import (
            ControllableUnitSuspensionCommentHistoryResponse,
        )
        from ..models.party_history_response import PartyHistoryResponse

        d = dict(src_dict)
        id = d.pop("id")

        controllable_unit_id = d.pop("controllable_unit_id")

        impacted_system_operator_id = d.pop("impacted_system_operator_id")

        reason = ControllableUnitSuspensionReason(d.pop("reason"))

        recorded_at = datetime.datetime.fromisoformat(d.pop("recorded_at"))

        recorded_by = d.pop("recorded_by")

        controllable_unit_suspension_id = d.pop("controllable_unit_suspension_id")

        def _parse_replaced_by(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        replaced_by = _parse_replaced_by(d.pop("replaced_by", UNSET))

        def _parse_replaced_at(data: object) -> datetime.datetime | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                replaced_at_type_0 = datetime.datetime.fromisoformat(data)

                return replaced_at_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.datetime | None | Unset, data)

        replaced_at = _parse_replaced_at(d.pop("replaced_at", UNSET))

        def _parse_controllable_unit_history(data: object) -> list[ControllableUnitHistoryResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                controllable_unit_history_type_0 = []
                _controllable_unit_history_type_0 = data
                for controllable_unit_history_type_0_item_data in _controllable_unit_history_type_0:
                    controllable_unit_history_type_0_item = ControllableUnitHistoryResponse.from_dict(
                        controllable_unit_history_type_0_item_data
                    )

                    controllable_unit_history_type_0.append(controllable_unit_history_type_0_item)

                return controllable_unit_history_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[ControllableUnitHistoryResponse] | None | Unset, data)

        controllable_unit_history = _parse_controllable_unit_history(d.pop("controllable_unit_history", UNSET))

        def _parse_impacted_system_operator_history(data: object) -> list[PartyHistoryResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                impacted_system_operator_history_type_0 = []
                _impacted_system_operator_history_type_0 = data
                for impacted_system_operator_history_type_0_item_data in _impacted_system_operator_history_type_0:
                    impacted_system_operator_history_type_0_item = PartyHistoryResponse.from_dict(
                        impacted_system_operator_history_type_0_item_data
                    )

                    impacted_system_operator_history_type_0.append(impacted_system_operator_history_type_0_item)

                return impacted_system_operator_history_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[PartyHistoryResponse] | None | Unset, data)

        impacted_system_operator_history = _parse_impacted_system_operator_history(
            d.pop("impacted_system_operator_history", UNSET)
        )

        def _parse_comment_history(
            data: object,
        ) -> list[ControllableUnitSuspensionCommentHistoryResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                comment_history_type_0 = []
                _comment_history_type_0 = data
                for comment_history_type_0_item_data in _comment_history_type_0:
                    comment_history_type_0_item = ControllableUnitSuspensionCommentHistoryResponse.from_dict(
                        comment_history_type_0_item_data
                    )

                    comment_history_type_0.append(comment_history_type_0_item)

                return comment_history_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[ControllableUnitSuspensionCommentHistoryResponse] | None | Unset, data)

        comment_history = _parse_comment_history(d.pop("comment_history", UNSET))

        controllable_unit_suspension_history_response = cls(
            id=id,
            controllable_unit_id=controllable_unit_id,
            impacted_system_operator_id=impacted_system_operator_id,
            reason=reason,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            controllable_unit_suspension_id=controllable_unit_suspension_id,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
            controllable_unit_history=controllable_unit_history,
            impacted_system_operator_history=impacted_system_operator_history,
            comment_history=comment_history,
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
