from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_product_suspension_reason import ServiceProvidingGroupProductSuspensionReason
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.party_response import PartyResponse
    from ..models.service_providing_group_product_suspension_comment_response import (
        ServiceProvidingGroupProductSuspensionCommentResponse,
    )
    from ..models.service_providing_group_response import ServiceProvidingGroupResponse


T = TypeVar("T", bound="ServiceProvidingGroupProductSuspensionResponse")


@_attrs_define
class ServiceProvidingGroupProductSuspensionResponse:
    """Response schema - The relation allowing a procuring system operator to temporarily suspend a service providing group
    from delivering products of certain types.

        Attributes:
            id (int): Unique surrogate identifier. Example: 12.
            procuring_system_operator_id (int): Reference to the procuring system operator suspending the service providing
                group. Example: 91.
            service_providing_group_id (int): Reference to the service providing group being suspended. Example: 7.
            product_type_ids (list[int]): References to the suspended product types. Example: [3, 6].
            reason (ServiceProvidingGroupProductSuspensionReason): The reason for the suspension. Example:
                failed_verification.
            recorded_at (datetime.datetime): When the resource was recorded (created or updated) in the system. Example:
                2023-12-31T23:59:00+00:00.
            recorded_by (int): The identity that recorded the resource. Example: 145.
            procuring_system_operator (None | PartyResponse | Unset): Embedded party
            service_providing_group (None | ServiceProvidingGroupResponse | Unset): Embedded service_providing_group
            comment (list[ServiceProvidingGroupProductSuspensionCommentResponse] | None | Unset): Embedded
                service_providing_group_product_suspension_comment
    """

    id: int
    procuring_system_operator_id: int
    service_providing_group_id: int
    product_type_ids: list[int]
    reason: ServiceProvidingGroupProductSuspensionReason
    recorded_at: datetime.datetime
    recorded_by: int
    procuring_system_operator: None | PartyResponse | Unset = UNSET
    service_providing_group: None | ServiceProvidingGroupResponse | Unset = UNSET
    comment: list[ServiceProvidingGroupProductSuspensionCommentResponse] | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.party_response import PartyResponse
        from ..models.service_providing_group_response import ServiceProvidingGroupResponse

        id = self.id

        procuring_system_operator_id = self.procuring_system_operator_id

        service_providing_group_id = self.service_providing_group_id

        product_type_ids = self.product_type_ids

        reason = self.reason.value

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        procuring_system_operator: dict[str, Any] | None | Unset
        if isinstance(self.procuring_system_operator, Unset):
            procuring_system_operator = UNSET
        elif isinstance(self.procuring_system_operator, PartyResponse):
            procuring_system_operator = self.procuring_system_operator.to_dict()
        else:
            procuring_system_operator = self.procuring_system_operator

        service_providing_group: dict[str, Any] | None | Unset
        if isinstance(self.service_providing_group, Unset):
            service_providing_group = UNSET
        elif isinstance(self.service_providing_group, ServiceProvidingGroupResponse):
            service_providing_group = self.service_providing_group.to_dict()
        else:
            service_providing_group = self.service_providing_group

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
                "procuring_system_operator_id": procuring_system_operator_id,
                "service_providing_group_id": service_providing_group_id,
                "product_type_ids": product_type_ids,
                "reason": reason,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
            }
        )
        if procuring_system_operator is not UNSET:
            field_dict["procuring_system_operator"] = procuring_system_operator
        if service_providing_group is not UNSET:
            field_dict["service_providing_group"] = service_providing_group
        if comment is not UNSET:
            field_dict["comment"] = comment

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.party_response import PartyResponse
        from ..models.service_providing_group_product_suspension_comment_response import (
            ServiceProvidingGroupProductSuspensionCommentResponse,
        )
        from ..models.service_providing_group_response import ServiceProvidingGroupResponse

        d = dict(src_dict)
        id = d.pop("id")

        procuring_system_operator_id = d.pop("procuring_system_operator_id")

        service_providing_group_id = d.pop("service_providing_group_id")

        product_type_ids = cast(list[int], d.pop("product_type_ids"))

        reason = ServiceProvidingGroupProductSuspensionReason(d.pop("reason"))

        recorded_at = datetime.datetime.fromisoformat(d.pop("recorded_at"))

        recorded_by = d.pop("recorded_by")

        def _parse_procuring_system_operator(data: object) -> None | PartyResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                procuring_system_operator_type_0 = PartyResponse.from_dict(data)

                return procuring_system_operator_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | PartyResponse | Unset, data)

        procuring_system_operator = _parse_procuring_system_operator(d.pop("procuring_system_operator", UNSET))

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

        def _parse_comment(data: object) -> list[ServiceProvidingGroupProductSuspensionCommentResponse] | None | Unset:
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
                    comment_type_0_item = ServiceProvidingGroupProductSuspensionCommentResponse.from_dict(
                        comment_type_0_item_data
                    )

                    comment_type_0.append(comment_type_0_item)

                return comment_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[ServiceProvidingGroupProductSuspensionCommentResponse] | None | Unset, data)

        comment = _parse_comment(d.pop("comment", UNSET))

        service_providing_group_product_suspension_response = cls(
            id=id,
            procuring_system_operator_id=procuring_system_operator_id,
            service_providing_group_id=service_providing_group_id,
            product_type_ids=product_type_ids,
            reason=reason,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            procuring_system_operator=procuring_system_operator,
            service_providing_group=service_providing_group,
            comment=comment,
        )

        service_providing_group_product_suspension_response.additional_properties = d
        return service_providing_group_product_suspension_response

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
