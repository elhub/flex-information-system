from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_provider_product_suspension_reason import ServiceProviderProductSuspensionReason

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
            recorded_at (str): When the resource was recorded (created or updated) in the system. Example: 2023-12-31
                23:59:00 CET.
            recorded_by (int): The identity that recorded the resource. Example: 145.
    """

    id: int
    procuring_system_operator_id: int
    service_provider_id: int
    product_type_ids: list[int]
    reason: ServiceProviderProductSuspensionReason
    recorded_at: str
    recorded_by: int
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        procuring_system_operator_id = self.procuring_system_operator_id

        service_provider_id = self.service_provider_id

        product_type_ids = self.product_type_ids

        reason = self.reason.value

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

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

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        procuring_system_operator_id = d.pop("procuring_system_operator_id")

        service_provider_id = d.pop("service_provider_id")

        product_type_ids = cast(list[int], d.pop("product_type_ids"))

        reason = ServiceProviderProductSuspensionReason(d.pop("reason"))

        recorded_at = d.pop("recorded_at")

        recorded_by = d.pop("recorded_by")

        service_provider_product_suspension_response = cls(
            id=id,
            procuring_system_operator_id=procuring_system_operator_id,
            service_provider_id=service_provider_id,
            product_type_ids=product_type_ids,
            reason=reason,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
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
