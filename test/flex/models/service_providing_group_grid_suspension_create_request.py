from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_grid_suspension_reason import ServiceProvidingGroupGridSuspensionReason
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProvidingGroupGridSuspensionCreateRequest")


@_attrs_define
class ServiceProvidingGroupGridSuspensionCreateRequest:
    """Request schema for create operations - The relation allowing an impacted system operator to temporarily suspend a
    service providing group from delivering services.

        Attributes:
            service_providing_group_id (int): Reference to the service providing group being suspended. Example: 13.
            reason (ServiceProvidingGroupGridSuspensionReason): The reason for the suspension. Example:
                significant_group_change.
            impacted_system_operator_id (int | Unset): Reference to the impacted system operator suspending the service
                providing group. Example: 7.
    """

    service_providing_group_id: int
    reason: ServiceProvidingGroupGridSuspensionReason
    impacted_system_operator_id: int | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        service_providing_group_id = self.service_providing_group_id

        reason = self.reason.value

        impacted_system_operator_id = self.impacted_system_operator_id

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "service_providing_group_id": service_providing_group_id,
                "reason": reason,
            }
        )
        if impacted_system_operator_id is not UNSET:
            field_dict["impacted_system_operator_id"] = impacted_system_operator_id

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        service_providing_group_id = d.pop("service_providing_group_id")

        reason = ServiceProvidingGroupGridSuspensionReason(d.pop("reason"))

        impacted_system_operator_id = d.pop("impacted_system_operator_id", UNSET)

        service_providing_group_grid_suspension_create_request = cls(
            service_providing_group_id=service_providing_group_id,
            reason=reason,
            impacted_system_operator_id=impacted_system_operator_id,
        )

        service_providing_group_grid_suspension_create_request.additional_properties = d
        return service_providing_group_grid_suspension_create_request

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
