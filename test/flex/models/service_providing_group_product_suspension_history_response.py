from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_product_suspension_reason import ServiceProvidingGroupProductSuspensionReason
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProvidingGroupProductSuspensionHistoryResponse")


@_attrs_define
class ServiceProvidingGroupProductSuspensionHistoryResponse:
    """Service Providing Group Product Suspension - history

    Attributes:
        service_providing_group_product_suspension_id (int): Reference to the resource that was updated. Example: 48.
        product_type_ids (list[int] | Unset): References to the suspended product types. Example: [3, 6].
        reason (ServiceProvidingGroupProductSuspensionReason | Unset): The reason for the suspension. Example:
            failed_verification.
        procuring_system_operator_id (int | Unset): Reference to the procuring system operator suspending the service
            providing group. Example: 91.
        service_providing_group_id (int | Unset): Reference to the service providing group being suspended. Example: 7.
        recorded_at (str | Unset): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31 23:59:00 CET.
        recorded_by (int | Unset): The identity that recorded the resource. Example: 145.
        id (int | Unset): Unique surrogate identifier. Example: 12.
        replaced_by (int | None | Unset): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (None | str | Unset): When the resource was replaced in the system. Example: 2024-07-07 10:00:00
            CET.
    """

    service_providing_group_product_suspension_id: int
    product_type_ids: list[int] | Unset = UNSET
    reason: ServiceProvidingGroupProductSuspensionReason | Unset = UNSET
    procuring_system_operator_id: int | Unset = UNSET
    service_providing_group_id: int | Unset = UNSET
    recorded_at: str | Unset = UNSET
    recorded_by: int | Unset = UNSET
    id: int | Unset = UNSET
    replaced_by: int | None | Unset = UNSET
    replaced_at: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        service_providing_group_product_suspension_id = self.service_providing_group_product_suspension_id

        product_type_ids: list[int] | Unset = UNSET
        if not isinstance(self.product_type_ids, Unset):
            product_type_ids = self.product_type_ids

        reason: str | Unset = UNSET
        if not isinstance(self.reason, Unset):
            reason = self.reason.value

        procuring_system_operator_id = self.procuring_system_operator_id

        service_providing_group_id = self.service_providing_group_id

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
                "service_providing_group_product_suspension_id": service_providing_group_product_suspension_id,
            }
        )
        if product_type_ids is not UNSET:
            field_dict["product_type_ids"] = product_type_ids
        if reason is not UNSET:
            field_dict["reason"] = reason
        if procuring_system_operator_id is not UNSET:
            field_dict["procuring_system_operator_id"] = procuring_system_operator_id
        if service_providing_group_id is not UNSET:
            field_dict["service_providing_group_id"] = service_providing_group_id
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
        service_providing_group_product_suspension_id = d.pop("service_providing_group_product_suspension_id")

        product_type_ids = cast(list[int], d.pop("product_type_ids", UNSET))

        _reason = d.pop("reason", UNSET)
        reason: ServiceProvidingGroupProductSuspensionReason | Unset
        if isinstance(_reason, Unset):
            reason = UNSET
        else:
            reason = ServiceProvidingGroupProductSuspensionReason(_reason)

        procuring_system_operator_id = d.pop("procuring_system_operator_id", UNSET)

        service_providing_group_id = d.pop("service_providing_group_id", UNSET)

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

        service_providing_group_product_suspension_history_response = cls(
            service_providing_group_product_suspension_id=service_providing_group_product_suspension_id,
            product_type_ids=product_type_ids,
            reason=reason,
            procuring_system_operator_id=procuring_system_operator_id,
            service_providing_group_id=service_providing_group_id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            id=id,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
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
