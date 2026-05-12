from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_bidding_zone import ServiceProvidingGroupBiddingZone
from ..models.service_providing_group_status import ServiceProvidingGroupStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProvidingGroupUpdateRequest")


@_attrs_define
class ServiceProvidingGroupUpdateRequest:
    """Request schema for update operations - Group of controllable units

    Attributes:
        name (str | Unset): Free text name of the service providing group. Example: Batteries #09.
        bidding_zone (ServiceProvidingGroupBiddingZone | Unset): The bidding zone that restricts which CUs that can be
            added to the group. Also known as scheduling area or price area for TSO. Example: NO3.
        status (ServiceProvidingGroupStatus | Unset): The status of the group. Example: active.
        additional_information (None | str | Unset): Free text field for extra information about the service providing
            group if needed.
    """

    name: str | Unset = UNSET
    bidding_zone: ServiceProvidingGroupBiddingZone | Unset = UNSET
    status: ServiceProvidingGroupStatus | Unset = UNSET
    additional_information: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        name = self.name

        bidding_zone: str | Unset = UNSET
        if not isinstance(self.bidding_zone, Unset):
            bidding_zone = self.bidding_zone.value

        status: str | Unset = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        additional_information: None | str | Unset
        if isinstance(self.additional_information, Unset):
            additional_information = UNSET
        else:
            additional_information = self.additional_information

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if name is not UNSET:
            field_dict["name"] = name
        if bidding_zone is not UNSET:
            field_dict["bidding_zone"] = bidding_zone
        if status is not UNSET:
            field_dict["status"] = status
        if additional_information is not UNSET:
            field_dict["additional_information"] = additional_information

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        name = d.pop("name", UNSET)

        _bidding_zone = d.pop("bidding_zone", UNSET)
        bidding_zone: ServiceProvidingGroupBiddingZone | Unset
        if isinstance(_bidding_zone, Unset):
            bidding_zone = UNSET
        else:
            bidding_zone = ServiceProvidingGroupBiddingZone(_bidding_zone)

        _status = d.pop("status", UNSET)
        status: ServiceProvidingGroupStatus | Unset
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = ServiceProvidingGroupStatus(_status)

        def _parse_additional_information(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        additional_information = _parse_additional_information(d.pop("additional_information", UNSET))

        service_providing_group_update_request = cls(
            name=name,
            bidding_zone=bidding_zone,
            status=status,
            additional_information=additional_information,
        )

        service_providing_group_update_request.additional_properties = d
        return service_providing_group_update_request

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
