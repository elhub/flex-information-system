from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_product_suspension_reason import ServiceProvidingGroupProductSuspensionReason
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.party_history_response import PartyHistoryResponse
    from ..models.service_providing_group_history_response import ServiceProvidingGroupHistoryResponse
    from ..models.service_providing_group_product_suspension_comment_history_response import (
        ServiceProvidingGroupProductSuspensionCommentHistoryResponse,
    )


T = TypeVar("T", bound="ServiceProvidingGroupProductSuspensionHistoryResponse")


@_attrs_define
class ServiceProvidingGroupProductSuspensionHistoryResponse:
    """Service Providing Group Product Suspension - history

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
        service_providing_group_product_suspension_id (int): Reference to the resource that was updated. Example: 48.
        replaced_by (int | None | Unset): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (datetime.datetime | None | Unset): When the resource was replaced in the system. Example:
            2024-07-07T10:00:00+00:00.
        procuring_system_operator_history (list[PartyHistoryResponse] | None | Unset): Embedded party_history
        service_providing_group_history (list[ServiceProvidingGroupHistoryResponse] | None | Unset): Embedded
            service_providing_group_history
        comment_history (list[ServiceProvidingGroupProductSuspensionCommentHistoryResponse] | None | Unset): Embedded
            service_providing_group_product_suspension_comment_history
    """

    id: int
    procuring_system_operator_id: int
    service_providing_group_id: int
    product_type_ids: list[int]
    reason: ServiceProvidingGroupProductSuspensionReason
    recorded_at: datetime.datetime
    recorded_by: int
    service_providing_group_product_suspension_id: int
    replaced_by: int | None | Unset = UNSET
    replaced_at: datetime.datetime | None | Unset = UNSET
    procuring_system_operator_history: list[PartyHistoryResponse] | None | Unset = UNSET
    service_providing_group_history: list[ServiceProvidingGroupHistoryResponse] | None | Unset = UNSET
    comment_history: list[ServiceProvidingGroupProductSuspensionCommentHistoryResponse] | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        procuring_system_operator_id = self.procuring_system_operator_id

        service_providing_group_id = self.service_providing_group_id

        product_type_ids = self.product_type_ids

        reason = self.reason.value

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        service_providing_group_product_suspension_id = self.service_providing_group_product_suspension_id

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

        procuring_system_operator_history: list[dict[str, Any]] | None | Unset
        if isinstance(self.procuring_system_operator_history, Unset):
            procuring_system_operator_history = UNSET
        elif isinstance(self.procuring_system_operator_history, list):
            procuring_system_operator_history = []
            for procuring_system_operator_history_type_0_item_data in self.procuring_system_operator_history:
                procuring_system_operator_history_type_0_item = (
                    procuring_system_operator_history_type_0_item_data.to_dict()
                )
                procuring_system_operator_history.append(procuring_system_operator_history_type_0_item)

        else:
            procuring_system_operator_history = self.procuring_system_operator_history

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
                "procuring_system_operator_id": procuring_system_operator_id,
                "service_providing_group_id": service_providing_group_id,
                "product_type_ids": product_type_ids,
                "reason": reason,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
                "service_providing_group_product_suspension_id": service_providing_group_product_suspension_id,
            }
        )
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at
        if procuring_system_operator_history is not UNSET:
            field_dict["procuring_system_operator_history"] = procuring_system_operator_history
        if service_providing_group_history is not UNSET:
            field_dict["service_providing_group_history"] = service_providing_group_history
        if comment_history is not UNSET:
            field_dict["comment_history"] = comment_history

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.party_history_response import PartyHistoryResponse
        from ..models.service_providing_group_history_response import ServiceProvidingGroupHistoryResponse
        from ..models.service_providing_group_product_suspension_comment_history_response import (
            ServiceProvidingGroupProductSuspensionCommentHistoryResponse,
        )

        d = dict(src_dict)
        id = d.pop("id")

        procuring_system_operator_id = d.pop("procuring_system_operator_id")

        service_providing_group_id = d.pop("service_providing_group_id")

        product_type_ids = cast(list[int], d.pop("product_type_ids"))

        reason = ServiceProvidingGroupProductSuspensionReason(d.pop("reason"))

        recorded_at = datetime.datetime.fromisoformat(d.pop("recorded_at"))

        recorded_by = d.pop("recorded_by")

        service_providing_group_product_suspension_id = d.pop("service_providing_group_product_suspension_id")

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

        def _parse_procuring_system_operator_history(data: object) -> list[PartyHistoryResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                procuring_system_operator_history_type_0 = []
                _procuring_system_operator_history_type_0 = data
                for procuring_system_operator_history_type_0_item_data in _procuring_system_operator_history_type_0:
                    procuring_system_operator_history_type_0_item = PartyHistoryResponse.from_dict(
                        procuring_system_operator_history_type_0_item_data
                    )

                    procuring_system_operator_history_type_0.append(procuring_system_operator_history_type_0_item)

                return procuring_system_operator_history_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[PartyHistoryResponse] | None | Unset, data)

        procuring_system_operator_history = _parse_procuring_system_operator_history(
            d.pop("procuring_system_operator_history", UNSET)
        )

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

        def _parse_comment_history(
            data: object,
        ) -> list[ServiceProvidingGroupProductSuspensionCommentHistoryResponse] | None | Unset:
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
                    comment_history_type_0_item = (
                        ServiceProvidingGroupProductSuspensionCommentHistoryResponse.from_dict(
                            comment_history_type_0_item_data
                        )
                    )

                    comment_history_type_0.append(comment_history_type_0_item)

                return comment_history_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[ServiceProvidingGroupProductSuspensionCommentHistoryResponse] | None | Unset, data)

        comment_history = _parse_comment_history(d.pop("comment_history", UNSET))

        service_providing_group_product_suspension_history_response = cls(
            id=id,
            procuring_system_operator_id=procuring_system_operator_id,
            service_providing_group_id=service_providing_group_id,
            product_type_ids=product_type_ids,
            reason=reason,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            service_providing_group_product_suspension_id=service_providing_group_product_suspension_id,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
            procuring_system_operator_history=procuring_system_operator_history,
            service_providing_group_history=service_providing_group_history,
            comment_history=comment_history,
        )

        service_providing_group_product_suspension_history_response.additional_properties = d
        return service_providing_group_product_suspension_history_response

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
