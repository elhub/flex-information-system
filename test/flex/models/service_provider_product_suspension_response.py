from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..models.service_provider_product_suspension_reason import ServiceProviderProductSuspensionReason
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.party_response import PartyResponse
    from ..models.service_provider_product_suspension_comment_response import (
        ServiceProviderProductSuspensionCommentResponse,
    )


T = TypeVar("T", bound="ServiceProviderProductSuspensionResponse")


@_attrs_define
class ServiceProviderProductSuspensionResponse:
    """Response schema - The relation allowing a procuring system operator to temporarily suspend a service provider from
    delivering them products of the given types.

        Attributes:
            id (int): Unique surrogate identifier. Example: 74.
            procuring_system_operator_id (int): Reference to the procuring system operator suspending the service provider.
                Example: 9.
            service_provider_id (int): Reference to the service provider being suspended. Example: 52.
            product_type_ids (list[int]): References to the suspended product types. Example: [1, 7].
            reason (ServiceProviderProductSuspensionReason): The reason for the suspension. Example: communication_issues.
            recorded_at (datetime.datetime): When the resource was recorded (created or updated) in the system. Example:
                2023-12-31T23:59:00+00:00.
            recorded_by (int): The identity that recorded the resource. Example: 145.
            procuring_system_operator (None | PartyResponse | Unset): Embedded party
            service_provider (None | PartyResponse | Unset): Embedded party
            comment (None | ServiceProviderProductSuspensionCommentResponse | Unset): Embedded
                service_provider_product_suspension_comment
    """

    id: int
    procuring_system_operator_id: int
    service_provider_id: int
    product_type_ids: list[int]
    reason: ServiceProviderProductSuspensionReason
    recorded_at: datetime.datetime
    recorded_by: int
    procuring_system_operator: None | PartyResponse | Unset = UNSET
    service_provider: None | PartyResponse | Unset = UNSET
    comment: None | ServiceProviderProductSuspensionCommentResponse | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.party_response import PartyResponse
        from ..models.service_provider_product_suspension_comment_response import (
            ServiceProviderProductSuspensionCommentResponse,
        )

        id = self.id

        procuring_system_operator_id = self.procuring_system_operator_id

        service_provider_id = self.service_provider_id

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

        service_provider: dict[str, Any] | None | Unset
        if isinstance(self.service_provider, Unset):
            service_provider = UNSET
        elif isinstance(self.service_provider, PartyResponse):
            service_provider = self.service_provider.to_dict()
        else:
            service_provider = self.service_provider

        comment: dict[str, Any] | None | Unset
        if isinstance(self.comment, Unset):
            comment = UNSET
        elif isinstance(self.comment, ServiceProviderProductSuspensionCommentResponse):
            comment = self.comment.to_dict()
        else:
            comment = self.comment

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "procuring_system_operator_id": procuring_system_operator_id,
                "service_provider_id": service_provider_id,
                "product_type_ids": product_type_ids,
                "reason": reason,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
            }
        )
        if procuring_system_operator is not UNSET:
            field_dict["procuring_system_operator"] = procuring_system_operator
        if service_provider is not UNSET:
            field_dict["service_provider"] = service_provider
        if comment is not UNSET:
            field_dict["comment"] = comment

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.party_response import PartyResponse
        from ..models.service_provider_product_suspension_comment_response import (
            ServiceProviderProductSuspensionCommentResponse,
        )

        d = dict(src_dict)
        id = d.pop("id")

        procuring_system_operator_id = d.pop("procuring_system_operator_id")

        service_provider_id = d.pop("service_provider_id")

        product_type_ids = cast(list[int], d.pop("product_type_ids"))

        reason = ServiceProviderProductSuspensionReason(d.pop("reason"))

        recorded_at = isoparse(d.pop("recorded_at"))

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

        def _parse_service_provider(data: object) -> None | PartyResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                service_provider_type_0 = PartyResponse.from_dict(data)

                return service_provider_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | PartyResponse | Unset, data)

        service_provider = _parse_service_provider(d.pop("service_provider", UNSET))

        def _parse_comment(data: object) -> None | ServiceProviderProductSuspensionCommentResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                comment_type_0 = ServiceProviderProductSuspensionCommentResponse.from_dict(data)

                return comment_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | ServiceProviderProductSuspensionCommentResponse | Unset, data)

        comment = _parse_comment(d.pop("comment", UNSET))

        service_provider_product_suspension_response = cls(
            id=id,
            procuring_system_operator_id=procuring_system_operator_id,
            service_provider_id=service_provider_id,
            product_type_ids=product_type_ids,
            reason=reason,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            procuring_system_operator=procuring_system_operator,
            service_provider=service_provider,
            comment=comment,
        )

        service_provider_product_suspension_response.additional_properties = d
        return service_provider_product_suspension_response

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
