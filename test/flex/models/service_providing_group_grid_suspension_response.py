from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..models.service_providing_group_grid_suspension_reason import ServiceProvidingGroupGridSuspensionReason
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.party_response import PartyResponse
    from ..models.service_providing_group_grid_suspension_comment_response import (
        ServiceProvidingGroupGridSuspensionCommentResponse,
    )
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
            service_providing_group (None | ServiceProvidingGroupResponse | Unset): Embedded service_providing_group
            comment (None | ServiceProvidingGroupGridSuspensionCommentResponse | Unset): Embedded
                service_providing_group_grid_suspension_comment
    """

    id: int
    impacted_system_operator_id: int
    service_providing_group_id: int
    reason: ServiceProvidingGroupGridSuspensionReason
    recorded_at: datetime.datetime
    recorded_by: int
    impacted_system_operator: None | PartyResponse | Unset = UNSET
    service_providing_group: None | ServiceProvidingGroupResponse | Unset = UNSET
    comment: None | ServiceProvidingGroupGridSuspensionCommentResponse | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.party_response import PartyResponse
        from ..models.service_providing_group_grid_suspension_comment_response import (
            ServiceProvidingGroupGridSuspensionCommentResponse,
        )
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

        service_providing_group: dict[str, Any] | None | Unset
        if isinstance(self.service_providing_group, Unset):
            service_providing_group = UNSET
        elif isinstance(self.service_providing_group, ServiceProvidingGroupResponse):
            service_providing_group = self.service_providing_group.to_dict()
        else:
            service_providing_group = self.service_providing_group

        comment: dict[str, Any] | None | Unset
        if isinstance(self.comment, Unset):
            comment = UNSET
        elif isinstance(self.comment, ServiceProvidingGroupGridSuspensionCommentResponse):
            comment = self.comment.to_dict()
        else:
            comment = self.comment

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
        if service_providing_group is not UNSET:
            field_dict["service_providing_group"] = service_providing_group
        if comment is not UNSET:
            field_dict["comment"] = comment

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.party_response import PartyResponse
        from ..models.service_providing_group_grid_suspension_comment_response import (
            ServiceProvidingGroupGridSuspensionCommentResponse,
        )
        from ..models.service_providing_group_response import ServiceProvidingGroupResponse

        d = dict(src_dict)
        id = d.pop("id")

        impacted_system_operator_id = d.pop("impacted_system_operator_id")

        service_providing_group_id = d.pop("service_providing_group_id")

        reason = ServiceProvidingGroupGridSuspensionReason(d.pop("reason"))

        recorded_at = isoparse(d.pop("recorded_at"))

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

        def _parse_comment(data: object) -> None | ServiceProvidingGroupGridSuspensionCommentResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                comment_type_0 = ServiceProvidingGroupGridSuspensionCommentResponse.from_dict(data)

                return comment_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | ServiceProvidingGroupGridSuspensionCommentResponse | Unset, data)

        comment = _parse_comment(d.pop("comment", UNSET))

        service_providing_group_grid_suspension_response = cls(
            id=id,
            impacted_system_operator_id=impacted_system_operator_id,
            service_providing_group_id=service_providing_group_id,
            reason=reason,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            impacted_system_operator=impacted_system_operator,
            service_providing_group=service_providing_group,
            comment=comment,
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
