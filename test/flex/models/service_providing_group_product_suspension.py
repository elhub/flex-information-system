from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_product_suspension_reason import ServiceProvidingGroupProductSuspensionReason

T = TypeVar("T", bound="ServiceProvidingGroupProductSuspension")


@_attrs_define
class ServiceProvidingGroupProductSuspension:
    """Data schema - The relation allowing a procuring system operator to temporarily suspend a service providing group
    from delivering products of certain types.

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
    """

    id: int
    procuring_system_operator_id: int
    service_providing_group_id: int
    product_type_ids: list[int]
    reason: ServiceProvidingGroupProductSuspensionReason
    recorded_at: str
    recorded_by: int
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        procuring_system_operator_id = self.procuring_system_operator_id

        service_providing_group_id = self.service_providing_group_id

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
                "service_providing_group_id": service_providing_group_id,
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

        service_providing_group_id = d.pop("service_providing_group_id")

        product_type_ids = cast(list[int], d.pop("product_type_ids"))

        reason = ServiceProvidingGroupProductSuspensionReason(d.pop("reason"))

        recorded_at = d.pop("recorded_at")

        recorded_by = d.pop("recorded_by")

        service_providing_group_product_suspension = cls(
            id=id,
            procuring_system_operator_id=procuring_system_operator_id,
            service_providing_group_id=service_providing_group_id,
            product_type_ids=product_type_ids,
            reason=reason,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
        )

        service_providing_group_product_suspension.additional_properties = d
        return service_providing_group_product_suspension

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
