from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_grid_suspension_reason import ServiceProvidingGroupGridSuspensionReason

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
            recorded_at (str): When the resource was recorded (created or updated) in the system. Example:
                2023-12-31T23:59:00Z.
            recorded_by (int): The identity that recorded the resource. Example: 145.
    """

    id: int
    impacted_system_operator_id: int
    service_providing_group_id: int
    reason: ServiceProvidingGroupGridSuspensionReason
    recorded_at: str
    recorded_by: int
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        impacted_system_operator_id = self.impacted_system_operator_id

        service_providing_group_id = self.service_providing_group_id

        reason = self.reason.value

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

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

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        impacted_system_operator_id = d.pop("impacted_system_operator_id")

        service_providing_group_id = d.pop("service_providing_group_id")

        reason = ServiceProvidingGroupGridSuspensionReason(d.pop("reason"))

        recorded_at = d.pop("recorded_at")

        recorded_by = d.pop("recorded_by")

        service_providing_group_grid_suspension_response = cls(
            id=id,
            impacted_system_operator_id=impacted_system_operator_id,
            service_providing_group_id=service_providing_group_id,
            reason=reason,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
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
