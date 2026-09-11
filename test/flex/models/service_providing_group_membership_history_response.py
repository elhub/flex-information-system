from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.controllable_unit_history_response import ControllableUnitHistoryResponse
    from ..models.service_providing_group_history_response import ServiceProvidingGroupHistoryResponse


T = TypeVar("T", bound="ServiceProvidingGroupMembershipHistoryResponse")


@_attrs_define
class ServiceProvidingGroupMembershipHistoryResponse:
    """Membership relation of controllable unit in service providing group - history

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
        service_providing_group_membership_id (int): Reference to the resource that was updated. Example: 48.
        valid_to (datetime.datetime | None | Unset): The date until which the relation between the controllable unit and
            the service providing group is valid. Midnight aligned on Norwegian timezone.
        replaced_by (int | None | Unset): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (datetime.datetime | None | Unset): When the resource was replaced in the system. Example:
            2024-07-07T10:00:00+00:00.
        controllable_unit_history (list[ControllableUnitHistoryResponse] | None | Unset): Embedded
            controllable_unit_history
        service_providing_group_history (list[ServiceProvidingGroupHistoryResponse] | None | Unset): Embedded
            service_providing_group_history
    """

    id: int
    controllable_unit_id: int
    service_providing_group_id: int
    valid_from: datetime.datetime
    recorded_at: datetime.datetime
    recorded_by: int
    service_providing_group_membership_id: int
    valid_to: datetime.datetime | None | Unset = UNSET
    replaced_by: int | None | Unset = UNSET
    replaced_at: datetime.datetime | None | Unset = UNSET
    controllable_unit_history: list[ControllableUnitHistoryResponse] | None | Unset = UNSET
    service_providing_group_history: list[ServiceProvidingGroupHistoryResponse] | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        controllable_unit_id = self.controllable_unit_id

        service_providing_group_id = self.service_providing_group_id

        valid_from = self.valid_from.isoformat()

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        service_providing_group_membership_id = self.service_providing_group_membership_id

        valid_to: None | str | Unset
        if isinstance(self.valid_to, Unset):
            valid_to = UNSET
        elif isinstance(self.valid_to, datetime.datetime):
            valid_to = self.valid_to.isoformat()
        else:
            valid_to = self.valid_to

        replaced_by: int | None | Unset
        if isinstance(self.replaced_by, Unset):
            replaced_by = UNSET
        else:
            replaced_by = self.replaced_by

        replaced_at: None | str | Unset
        if isinstance(self.replaced_at, Unset):
            replaced_at = UNSET
        elif isinstance(self.replaced_at, datetime.datetime):
            replaced_at = self.replaced_at.isoformat()
        else:
            replaced_at = self.replaced_at

        controllable_unit_history: list[dict[str, Any]] | None | Unset
        if isinstance(self.controllable_unit_history, Unset):
            controllable_unit_history = UNSET
        elif isinstance(self.controllable_unit_history, list):
            controllable_unit_history = []
            for controllable_unit_history_type_0_item_data in self.controllable_unit_history:
                controllable_unit_history_type_0_item = controllable_unit_history_type_0_item_data.to_dict()
                controllable_unit_history.append(controllable_unit_history_type_0_item)

        else:
            controllable_unit_history = self.controllable_unit_history

        service_providing_group_history: list[dict[str, Any]] | None | Unset
        if isinstance(self.service_providing_group_history, Unset):
            service_providing_group_history = UNSET
        elif isinstance(self.service_providing_group_history, list):
            service_providing_group_history = []
            for service_providing_group_history_type_0_item_data in self.service_providing_group_history:
                service_providing_group_history_type_0_item = service_providing_group_history_type_0_item_data.to_dict()
                service_providing_group_history.append(service_providing_group_history_type_0_item)

        else:
            service_providing_group_history = self.service_providing_group_history

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
                "service_providing_group_membership_id": service_providing_group_membership_id,
            }
        )
        if valid_to is not UNSET:
            field_dict["valid_to"] = valid_to
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at
        if controllable_unit_history is not UNSET:
            field_dict["controllable_unit_history"] = controllable_unit_history
        if service_providing_group_history is not UNSET:
            field_dict["service_providing_group_history"] = service_providing_group_history

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.controllable_unit_history_response import ControllableUnitHistoryResponse
        from ..models.service_providing_group_history_response import ServiceProvidingGroupHistoryResponse

        d = dict(src_dict)
        id = d.pop("id")

        controllable_unit_id = d.pop("controllable_unit_id")

        service_providing_group_id = d.pop("service_providing_group_id")

        valid_from = datetime.datetime.fromisoformat(d.pop("valid_from"))

        recorded_at = datetime.datetime.fromisoformat(d.pop("recorded_at"))

        recorded_by = d.pop("recorded_by")

        service_providing_group_membership_id = d.pop("service_providing_group_membership_id")

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

        def _parse_replaced_by(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        replaced_by = _parse_replaced_by(d.pop("replaced_by", UNSET))

        def _parse_replaced_at(data: object) -> datetime.datetime | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                replaced_at_type_0 = datetime.datetime.fromisoformat(data)

                return replaced_at_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.datetime | None | Unset, data)

        replaced_at = _parse_replaced_at(d.pop("replaced_at", UNSET))

        def _parse_controllable_unit_history(data: object) -> list[ControllableUnitHistoryResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                controllable_unit_history_type_0 = []
                _controllable_unit_history_type_0 = data
                for controllable_unit_history_type_0_item_data in _controllable_unit_history_type_0:
                    controllable_unit_history_type_0_item = ControllableUnitHistoryResponse.from_dict(
                        controllable_unit_history_type_0_item_data
                    )

                    controllable_unit_history_type_0.append(controllable_unit_history_type_0_item)

                return controllable_unit_history_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[ControllableUnitHistoryResponse] | None | Unset, data)

        controllable_unit_history = _parse_controllable_unit_history(d.pop("controllable_unit_history", UNSET))

        def _parse_service_providing_group_history(
            data: object,
        ) -> list[ServiceProvidingGroupHistoryResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                service_providing_group_history_type_0 = []
                _service_providing_group_history_type_0 = data
                for service_providing_group_history_type_0_item_data in _service_providing_group_history_type_0:
                    service_providing_group_history_type_0_item = ServiceProvidingGroupHistoryResponse.from_dict(
                        service_providing_group_history_type_0_item_data
                    )

                    service_providing_group_history_type_0.append(service_providing_group_history_type_0_item)

                return service_providing_group_history_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[ServiceProvidingGroupHistoryResponse] | None | Unset, data)

        service_providing_group_history = _parse_service_providing_group_history(
            d.pop("service_providing_group_history", UNSET)
        )

        service_providing_group_membership_history_response = cls(
            id=id,
            controllable_unit_id=controllable_unit_id,
            service_providing_group_id=service_providing_group_id,
            valid_from=valid_from,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            service_providing_group_membership_id=service_providing_group_membership_id,
            valid_to=valid_to,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
            controllable_unit_history=controllable_unit_history,
            service_providing_group_history=service_providing_group_history,
        )

        service_providing_group_membership_history_response.additional_properties = d
        return service_providing_group_membership_history_response

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
