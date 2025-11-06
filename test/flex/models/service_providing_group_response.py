from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_status import ServiceProvidingGroupStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProvidingGroupResponse")


@_attrs_define
class ServiceProvidingGroupResponse:
    """Response schema for operations with return values - Group of controllable units

    Attributes:
        name (str | Unset): Free text name of the service providing group. Example: Batteries #09.
        status (ServiceProvidingGroupStatus | Unset): The status of the group. Example: active.
        service_provider_id (int | Unset): Reference to the `party` (service provider) managing the group. Example: 17.
        recorded_at (str | Unset): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31 23:59:00 CET.
        recorded_by (int | Unset): The identity that recorded the resource. Example: 145.
        id (int | Unset): Unique surrogate key. Example: 4.
    """

    name: str | Unset = UNSET
    status: ServiceProvidingGroupStatus | Unset = UNSET
    service_provider_id: int | Unset = UNSET
    recorded_at: str | Unset = UNSET
    recorded_by: int | Unset = UNSET
    id: int | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        name = self.name

        status: str | Unset = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        service_provider_id = self.service_provider_id

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        id = self.id

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if name is not UNSET:
            field_dict["name"] = name
        if status is not UNSET:
            field_dict["status"] = status
        if service_provider_id is not UNSET:
            field_dict["service_provider_id"] = service_provider_id
        if recorded_at is not UNSET:
            field_dict["recorded_at"] = recorded_at
        if recorded_by is not UNSET:
            field_dict["recorded_by"] = recorded_by
        if id is not UNSET:
            field_dict["id"] = id

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        name = d.pop("name", UNSET)

        _status = d.pop("status", UNSET)
        status: ServiceProvidingGroupStatus | Unset
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = ServiceProvidingGroupStatus(_status)

        service_provider_id = d.pop("service_provider_id", UNSET)

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        id = d.pop("id", UNSET)

        service_providing_group_response = cls(
            name=name,
            status=status,
            service_provider_id=service_provider_id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            id=id,
        )

        service_providing_group_response.additional_properties = d
        return service_providing_group_response

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
