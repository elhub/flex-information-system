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
    """History response schema - The relation allowing a procuring system operator to temporarily suspend a service
    providing group from delivering products of certain types.

        Attributes:
            id (int): Unique surrogate identifier. Example: 12.
            procuring_system_operator_id (int): Reference to the procuring system operator suspending the service providing
                group. Example: 91.
            service_providing_group_id (int): Reference to the service providing group being suspended. Example: 7.
            product_type_ids (list[int]): References to the suspended product types. Example: [3, 6].
            reason (ServiceProvidingGroupProductSuspensionReason): The reason for the suspension. Example:
                failed_verification.
            recorded_at (str): When the resource was recorded (created or updated) in the system. Example: 2023-12-31
                23:59:00 CET.
            recorded_by (int): The identity that recorded the resource. Example: 145.
            service_providing_group_product_suspension_id (int): Reference to the resource that was updated. Example: 48.
            replaced_by (int | None | Unset): The identity that updated the resource when it was replaced. Example: 90.
            replaced_at (None | str | Unset): When the resource was replaced in the system. Example: 2024-07-07 10:00:00
                CET.
    """

    id: int
    procuring_system_operator_id: int
    service_providing_group_id: int
    product_type_ids: list[int]
    reason: ServiceProvidingGroupProductSuspensionReason
    recorded_at: str
    recorded_by: int
    service_providing_group_product_suspension_id: int
    replaced_by: int | None | Unset = UNSET
    replaced_at: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        procuring_system_operator_id = self.procuring_system_operator_id

        service_providing_group_id = self.service_providing_group_id

        product_type_ids = self.product_type_ids

        reason = self.reason.value

        recorded_at = self.recorded_at

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
        else:
            replaced_at = self.replaced_at

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

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        procuring_system_operator_id = d.pop("procuring_system_operator_id")

        service_providing_group_id = d.pop("service_providing_group_id")

        product_type_ids = cast(list[int], d.pop("product_type_ids"))

        reason = ServiceProvidingGroupProductSuspensionReason(d.pop("reason"))

        recorded_at = d.pop("recorded_at")

        recorded_by = d.pop("recorded_by")

        service_providing_group_product_suspension_id = d.pop("service_providing_group_product_suspension_id")

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
