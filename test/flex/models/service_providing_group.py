from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_bidding_zone import ServiceProvidingGroupBiddingZone
from ..models.service_providing_group_status import ServiceProvidingGroupStatus

T = TypeVar("T", bound="ServiceProvidingGroup")


@_attrs_define
class ServiceProvidingGroup:
    """Data schema - Group of controllable units

    Attributes:
        id (int): Unique surrogate key. Example: 4.
        name (str): Free text name of the service providing group. Example: Batteries #09.
        service_provider_id (int): Reference to the `party` (service provider) managing the group. Example: 17.
        bidding_zone (ServiceProvidingGroupBiddingZone): The bidding zone that restricts which CUs that can be added to
            the group. Also known as scheduling area or price area for TSO. Example: NO3.
        status (ServiceProvidingGroupStatus): The status of the group. Example: active.
        recorded_at (str): When the resource was recorded (created or updated) in the system. Example: 2023-12-31
            23:59:00 CET.
        recorded_by (int): The identity that recorded the resource. Example: 145.
    """

    id: int
    name: str
    service_provider_id: int
    bidding_zone: ServiceProvidingGroupBiddingZone
    status: ServiceProvidingGroupStatus
    recorded_at: str
    recorded_by: int
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        name = self.name

        service_provider_id = self.service_provider_id

        bidding_zone = self.bidding_zone.value

        status = self.status.value

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "name": name,
                "service_provider_id": service_provider_id,
                "bidding_zone": bidding_zone,
                "status": status,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        name = d.pop("name")

        service_provider_id = d.pop("service_provider_id")

        bidding_zone = ServiceProvidingGroupBiddingZone(d.pop("bidding_zone"))

        status = ServiceProvidingGroupStatus(d.pop("status"))

        recorded_at = d.pop("recorded_at")

        recorded_by = d.pop("recorded_by")

        service_providing_group = cls(
            id=id,
            name=name,
            service_provider_id=service_provider_id,
            bidding_zone=bidding_zone,
            status=status,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
        )

        service_providing_group.additional_properties = d
        return service_providing_group

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
