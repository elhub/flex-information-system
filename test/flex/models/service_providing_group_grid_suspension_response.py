from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_grid_suspension_reason import ServiceProvidingGroupGridSuspensionReason
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.party_history_response import PartyHistoryResponse
    from ..models.party_response import PartyResponse
    from ..models.service_providing_group_grid_suspension_comment_history_response import (
        ServiceProvidingGroupGridSuspensionCommentHistoryResponse,
    )
    from ..models.service_providing_group_grid_suspension_comment_response import (
        ServiceProvidingGroupGridSuspensionCommentResponse,
    )
    from ..models.service_providing_group_history_response import ServiceProvidingGroupHistoryResponse
    from ..models.service_providing_group_response import ServiceProvidingGroupResponse


T = TypeVar("T", bound="ServiceProvidingGroupGridSuspensionResponse")


@_attrs_define
class ServiceProvidingGroupGridSuspensionResponse:
    """Response schema - The relation allowing an impacted system operator to temporarily suspend a service providing group
    from delivering services.

        Attributes:
            id (int): Unique surrogate identifier. Example: 49.
            impacted_system_operator_id (int): Reference to the impacted system operator suspending the service providing
                group. Example: 7.
            service_providing_group_id (int): Reference to the service providing group being suspended. Example: 13.
            reason (ServiceProvidingGroupGridSuspensionReason): The reason for the suspension. Example:
                significant_group_change.
            recorded_at (datetime.datetime): When the resource was recorded (created or updated) in the system. Example:
                2023-12-31T23:59:00+00:00.
            recorded_by (int): The identity that recorded the resource. Example: 145.
            impacted_system_operator (None | PartyResponse | Unset): Embedded party
            impacted_system_operator_history (list[PartyHistoryResponse] | None | Unset): Embedded party_history
            service_providing_group (None | ServiceProvidingGroupResponse | Unset): Embedded service_providing_group
            service_providing_group_history (list[ServiceProvidingGroupHistoryResponse] | None | Unset): Embedded
                service_providing_group_history
            comment (list[ServiceProvidingGroupGridSuspensionCommentResponse] | None | Unset): Embedded
                service_providing_group_grid_suspension_comment
            comment_history (list[ServiceProvidingGroupGridSuspensionCommentHistoryResponse] | None | Unset): Embedded
                service_providing_group_grid_suspension_comment_history
    """

    id: int
    impacted_system_operator_id: int
    service_providing_group_id: int
    reason: ServiceProvidingGroupGridSuspensionReason
    recorded_at: datetime.datetime
    recorded_by: int
    impacted_system_operator: None | PartyResponse | Unset = UNSET
    impacted_system_operator_history: list[PartyHistoryResponse] | None | Unset = UNSET
    service_providing_group: None | ServiceProvidingGroupResponse | Unset = UNSET
    service_providing_group_history: list[ServiceProvidingGroupHistoryResponse] | None | Unset = UNSET
    comment: list[ServiceProvidingGroupGridSuspensionCommentResponse] | None | Unset = UNSET
    comment_history: list[ServiceProvidingGroupGridSuspensionCommentHistoryResponse] | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.party_response import PartyResponse
        from ..models.service_providing_group_response import ServiceProvidingGroupResponse

        id = self.id

        impacted_system_operator_id = self.impacted_system_operator_id

        service_providing_group_id = self.service_providing_group_id

        reason = self.reason.value

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        impacted_system_operator: dict[str, Any] | None | Unset
        if isinstance(self.impacted_system_operator, Unset):
            impacted_system_operator = UNSET
        elif isinstance(self.impacted_system_operator, PartyResponse):
            impacted_system_operator = self.impacted_system_operator.to_dict()
        else:
            impacted_system_operator = self.impacted_system_operator

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

        service_providing_group: dict[str, Any] | None | Unset
        if isinstance(self.service_providing_group, Unset):
            service_providing_group = UNSET
        elif isinstance(self.service_providing_group, ServiceProvidingGroupResponse):
            service_providing_group = self.service_providing_group.to_dict()
        else:
            service_providing_group = self.service_providing_group

        service_providing_group_history: list[dict[str, Any]] | None | Unset
        if isinstance(self.service_providing_group_history, Unset):
            service_providing_group_history = UNSET
        elif isinstance(self.service_providing_group_history, list):
            service_providing_group_history = []
            for service_providing_group_history_type_0_item_data in self.service_providing_group_history:
                service_providing_group_history_type_0_item = service_providing_group_history_type_0_item_data.to_dict()
                service_providing_group_history.append(service_providing_group_history_type_0_item)

        else:
            service_providing_group_history = self.service_providing_group_history

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
                "impacted_system_operator_id": impacted_system_operator_id,
                "service_providing_group_id": service_providing_group_id,
                "reason": reason,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
            }
        )
        if impacted_system_operator is not UNSET:
            field_dict["impacted_system_operator"] = impacted_system_operator
        if impacted_system_operator_history is not UNSET:
            field_dict["impacted_system_operator_history"] = impacted_system_operator_history
        if service_providing_group is not UNSET:
            field_dict["service_providing_group"] = service_providing_group
        if service_providing_group_history is not UNSET:
            field_dict["service_providing_group_history"] = service_providing_group_history
        if comment is not UNSET:
            field_dict["comment"] = comment
        if comment_history is not UNSET:
            field_dict["comment_history"] = comment_history

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.party_history_response import PartyHistoryResponse
        from ..models.party_response import PartyResponse
        from ..models.service_providing_group_grid_suspension_comment_history_response import (
            ServiceProvidingGroupGridSuspensionCommentHistoryResponse,
        )
        from ..models.service_providing_group_grid_suspension_comment_response import (
            ServiceProvidingGroupGridSuspensionCommentResponse,
        )
        from ..models.service_providing_group_history_response import ServiceProvidingGroupHistoryResponse
        from ..models.service_providing_group_response import ServiceProvidingGroupResponse

        d = dict(src_dict)
        id = d.pop("id")

        impacted_system_operator_id = d.pop("impacted_system_operator_id")

        service_providing_group_id = d.pop("service_providing_group_id")

        reason = ServiceProvidingGroupGridSuspensionReason(d.pop("reason"))

        recorded_at = datetime.datetime.fromisoformat(d.pop("recorded_at"))

        recorded_by = d.pop("recorded_by")

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

        def _parse_service_providing_group(data: object) -> None | ServiceProvidingGroupResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                service_providing_group_type_0 = ServiceProvidingGroupResponse.from_dict(data)

                return service_providing_group_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | ServiceProvidingGroupResponse | Unset, data)

        service_providing_group = _parse_service_providing_group(d.pop("service_providing_group", UNSET))

        def _parse_service_providing_group_history(
            data: object,
        ) -> list[ServiceProvidingGroupHistoryResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                service_providing_group_history_type_0 = []
                _service_providing_group_history_type_0 = data
                for service_providing_group_history_type_0_item_data in _service_providing_group_history_type_0:
                    service_providing_group_history_type_0_item = ServiceProvidingGroupHistoryResponse.from_dict(
                        service_providing_group_history_type_0_item_data
                    )

                    service_providing_group_history_type_0.append(service_providing_group_history_type_0_item)

                return service_providing_group_history_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[ServiceProvidingGroupHistoryResponse] | None | Unset, data)

        service_providing_group_history = _parse_service_providing_group_history(
            d.pop("service_providing_group_history", UNSET)
        )

        def _parse_comment(data: object) -> list[ServiceProvidingGroupGridSuspensionCommentResponse] | None | Unset:
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
                    comment_type_0_item = ServiceProvidingGroupGridSuspensionCommentResponse.from_dict(
                        comment_type_0_item_data
                    )

                    comment_type_0.append(comment_type_0_item)

                return comment_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[ServiceProvidingGroupGridSuspensionCommentResponse] | None | Unset, data)

        comment = _parse_comment(d.pop("comment", UNSET))

        def _parse_comment_history(
            data: object,
        ) -> list[ServiceProvidingGroupGridSuspensionCommentHistoryResponse] | None | Unset:
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
                    comment_history_type_0_item = ServiceProvidingGroupGridSuspensionCommentHistoryResponse.from_dict(
                        comment_history_type_0_item_data
                    )

                    comment_history_type_0.append(comment_history_type_0_item)

                return comment_history_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[ServiceProvidingGroupGridSuspensionCommentHistoryResponse] | None | Unset, data)

        comment_history = _parse_comment_history(d.pop("comment_history", UNSET))

        service_providing_group_grid_suspension_response = cls(
            id=id,
            impacted_system_operator_id=impacted_system_operator_id,
            service_providing_group_id=service_providing_group_id,
            reason=reason,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            impacted_system_operator=impacted_system_operator,
            impacted_system_operator_history=impacted_system_operator_history,
            service_providing_group=service_providing_group,
            service_providing_group_history=service_providing_group_history,
            comment=comment,
            comment_history=comment_history,
        )

        service_providing_group_grid_suspension_response.additional_properties = d
        return service_providing_group_grid_suspension_response

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
