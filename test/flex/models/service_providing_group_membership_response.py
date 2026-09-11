from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.controllable_unit_response import ControllableUnitResponse
    from ..models.service_providing_group_response import ServiceProvidingGroupResponse


T = TypeVar("T", bound="ServiceProvidingGroupMembershipResponse")


@_attrs_define
class ServiceProvidingGroupMembershipResponse:
    """Response schema - Membership relation of controllable unit in service providing group

    Attributes:
        id (int): Unique surrogate key. Example: 27.
        controllable_unit_id (int): Reference to the controllable unit this relation links to a service providing group.
            Example: 6.
        service_providing_group_id (int): Reference to the service providing group this relation links to a controllable
            unit. Example: 55.
        valid_from (datetime.datetime): The date from which the relation between the controllable unit and the service
            providing group is valid. Midnight aligned on Norwegian timezone. Example: 2022-08-08T00:00:00+02.
        recorded_at (datetime.datetime): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31T23:59:00+00:00.
        recorded_by (int): The identity that recorded the resource. Example: 145.
        valid_to (datetime.datetime | None | Unset): The date until which the relation between the controllable unit and
            the service providing group is valid. Midnight aligned on Norwegian timezone.
        controllable_unit (ControllableUnitResponse | None | Unset): Embedded controllable_unit
        service_providing_group (None | ServiceProvidingGroupResponse | Unset): Embedded service_providing_group
    """

    id: int
    controllable_unit_id: int
    service_providing_group_id: int
    valid_from: datetime.datetime
    recorded_at: datetime.datetime
    recorded_by: int
    valid_to: datetime.datetime | None | Unset = UNSET
    controllable_unit: ControllableUnitResponse | None | Unset = UNSET
    service_providing_group: None | ServiceProvidingGroupResponse | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.controllable_unit_response import ControllableUnitResponse
        from ..models.service_providing_group_response import ServiceProvidingGroupResponse

        id = self.id

        controllable_unit_id = self.controllable_unit_id

        service_providing_group_id = self.service_providing_group_id

        valid_from = self.valid_from.isoformat()

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        valid_to: None | str | Unset
        if isinstance(self.valid_to, Unset):
            valid_to = UNSET
        elif isinstance(self.valid_to, datetime.datetime):
            valid_to = self.valid_to.isoformat()
        else:
            valid_to = self.valid_to

        controllable_unit: dict[str, Any] | None | Unset
        if isinstance(self.controllable_unit, Unset):
            controllable_unit = UNSET
        elif isinstance(self.controllable_unit, ControllableUnitResponse):
            controllable_unit = self.controllable_unit.to_dict()
        else:
            controllable_unit = self.controllable_unit

        service_providing_group: dict[str, Any] | None | Unset
        if isinstance(self.service_providing_group, Unset):
            service_providing_group = UNSET
        elif isinstance(self.service_providing_group, ServiceProvidingGroupResponse):
            service_providing_group = self.service_providing_group.to_dict()
        else:
            service_providing_group = self.service_providing_group

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "controllable_unit_id": controllable_unit_id,
                "service_providing_group_id": service_providing_group_id,
                "valid_from": valid_from,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
            }
        )
        if valid_to is not UNSET:
            field_dict["valid_to"] = valid_to
        if controllable_unit is not UNSET:
            field_dict["controllable_unit"] = controllable_unit
        if service_providing_group is not UNSET:
            field_dict["service_providing_group"] = service_providing_group

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.controllable_unit_response import ControllableUnitResponse
        from ..models.service_providing_group_response import ServiceProvidingGroupResponse

        d = dict(src_dict)
        id = d.pop("id")

        controllable_unit_id = d.pop("controllable_unit_id")

        service_providing_group_id = d.pop("service_providing_group_id")

        valid_from = datetime.datetime.fromisoformat(d.pop("valid_from"))

        recorded_at = datetime.datetime.fromisoformat(d.pop("recorded_at"))

        recorded_by = d.pop("recorded_by")

        def _parse_valid_to(data: object) -> datetime.datetime | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                valid_to_type_0 = datetime.datetime.fromisoformat(data)

                return valid_to_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.datetime | None | Unset, data)

        valid_to = _parse_valid_to(d.pop("valid_to", UNSET))

        def _parse_controllable_unit(data: object) -> ControllableUnitResponse | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                controllable_unit_type_0 = ControllableUnitResponse.from_dict(data)

                return controllable_unit_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(ControllableUnitResponse | None | Unset, data)

        controllable_unit = _parse_controllable_unit(d.pop("controllable_unit", UNSET))

        def _parse_service_providing_group(data: object) -> None | ServiceProvidingGroupResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                service_providing_group_type_0 = ServiceProvidingGroupResponse.from_dict(data)

                return service_providing_group_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | ServiceProvidingGroupResponse | Unset, data)

        service_providing_group = _parse_service_providing_group(d.pop("service_providing_group", UNSET))

        service_providing_group_membership_response = cls(
            id=id,
            controllable_unit_id=controllable_unit_id,
            service_providing_group_id=service_providing_group_id,
            valid_from=valid_from,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            valid_to=valid_to,
            controllable_unit=controllable_unit,
            service_providing_group=service_providing_group,
        )

        service_providing_group_membership_response.additional_properties = d
        return service_providing_group_membership_response

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
