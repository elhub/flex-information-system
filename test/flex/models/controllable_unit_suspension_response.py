from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..models.controllable_unit_suspension_reason import ControllableUnitSuspensionReason
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.controllable_unit_response import ControllableUnitResponse
    from ..models.controllable_unit_suspension_comment_response import ControllableUnitSuspensionCommentResponse
    from ..models.party_response import PartyResponse


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
        controllable_unit (ControllableUnitResponse | None | Unset): Embedded controllable_unit
        impacted_system_operator (None | PartyResponse | Unset): Embedded party
        comment (list[ControllableUnitSuspensionCommentResponse] | None | Unset): Embedded
            controllable_unit_suspension_comment
    """

    id: int
    controllable_unit_id: int
    impacted_system_operator_id: int
    reason: ControllableUnitSuspensionReason
    recorded_at: datetime.datetime
    recorded_by: int
    controllable_unit: ControllableUnitResponse | None | Unset = UNSET
    impacted_system_operator: None | PartyResponse | Unset = UNSET
    comment: list[ControllableUnitSuspensionCommentResponse] | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.controllable_unit_response import ControllableUnitResponse
        from ..models.party_response import PartyResponse

        id = self.id

        controllable_unit_id = self.controllable_unit_id

        impacted_system_operator_id = self.impacted_system_operator_id

        reason = self.reason.value

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        controllable_unit: dict[str, Any] | None | Unset
        if isinstance(self.controllable_unit, Unset):
            controllable_unit = UNSET
        elif isinstance(self.controllable_unit, ControllableUnitResponse):
            controllable_unit = self.controllable_unit.to_dict()
        else:
            controllable_unit = self.controllable_unit

        impacted_system_operator: dict[str, Any] | None | Unset
        if isinstance(self.impacted_system_operator, Unset):
            impacted_system_operator = UNSET
        elif isinstance(self.impacted_system_operator, PartyResponse):
            impacted_system_operator = self.impacted_system_operator.to_dict()
        else:
            impacted_system_operator = self.impacted_system_operator

        comment: list[dict[str, Any]] | None | Unset
        if isinstance(self.comment, Unset):
            comment = UNSET
        elif isinstance(self.comment, list):
            comment = []
            for comment_type_0_item_data in self.comment:
                comment_type_0_item = comment_type_0_item_data.to_dict()
                comment.append(comment_type_0_item)

        else:
            comment = self.comment

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
        if controllable_unit is not UNSET:
            field_dict["controllable_unit"] = controllable_unit
        if impacted_system_operator is not UNSET:
            field_dict["impacted_system_operator"] = impacted_system_operator
        if comment is not UNSET:
            field_dict["comment"] = comment

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.controllable_unit_response import ControllableUnitResponse
        from ..models.controllable_unit_suspension_comment_response import ControllableUnitSuspensionCommentResponse
        from ..models.party_response import PartyResponse

        d = dict(src_dict)
        id = d.pop("id")

        controllable_unit_id = d.pop("controllable_unit_id")

        impacted_system_operator_id = d.pop("impacted_system_operator_id")

        reason = ControllableUnitSuspensionReason(d.pop("reason"))

        recorded_at = isoparse(d.pop("recorded_at"))

        recorded_by = d.pop("recorded_by")

        def _parse_controllable_unit(data: object) -> ControllableUnitResponse | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                controllable_unit_type_0 = ControllableUnitResponse.from_dict(data)

                return controllable_unit_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(ControllableUnitResponse | None | Unset, data)

        controllable_unit = _parse_controllable_unit(d.pop("controllable_unit", UNSET))

        def _parse_impacted_system_operator(data: object) -> None | PartyResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                impacted_system_operator_type_0 = PartyResponse.from_dict(data)

                return impacted_system_operator_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | PartyResponse | Unset, data)

        impacted_system_operator = _parse_impacted_system_operator(d.pop("impacted_system_operator", UNSET))

        def _parse_comment(data: object) -> list[ControllableUnitSuspensionCommentResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                comment_type_0 = []
                _comment_type_0 = data
                for comment_type_0_item_data in _comment_type_0:
                    comment_type_0_item = ControllableUnitSuspensionCommentResponse.from_dict(comment_type_0_item_data)

                    comment_type_0.append(comment_type_0_item)

                return comment_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[ControllableUnitSuspensionCommentResponse] | None | Unset, data)

        comment = _parse_comment(d.pop("comment", UNSET))

        controllable_unit_suspension_response = cls(
            id=id,
            controllable_unit_id=controllable_unit_id,
            impacted_system_operator_id=impacted_system_operator_id,
            reason=reason,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            controllable_unit=controllable_unit,
            impacted_system_operator=impacted_system_operator,
            comment=comment,
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
