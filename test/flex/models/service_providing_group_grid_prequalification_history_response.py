from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_grid_prequalification_status import (
    ServiceProvidingGroupGridPrequalificationStatus,
)
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProvidingGroupGridPrequalificationHistoryResponse")


@_attrs_define
class ServiceProvidingGroupGridPrequalificationHistoryResponse:
    """Grid prequalification for service providing group - history

    Attributes:
        service_providing_group_grid_prequalification_id (int): Reference to the resource that was updated. Example: 48.
        status (ServiceProvidingGroupGridPrequalificationStatus | Unset): The status of the grid prequalification for
            this service providing group. Example: in_progress.
        notes (None | str | Unset): Free text notes on the current prequalification status.
        prequalified_at (None | str | Unset): When the current grid prequalification was last approved. Example:
            2023-01-08 10:00:00 CET.
        service_providing_group_id (int | Unset): Reference to the service providing group whose grid prequalification
            is tracked by the current resource. Example: 55.
        impacted_system_operator_id (int | Unset): Reference to the `party` that is the impacted system operator.
            Example: 7.
        recorded_at (str | Unset): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31 23:59:00 CET.
        recorded_by (int | Unset): The identity that recorded the resource. Example: 145.
        id (int | Unset): Unique surrogate key. Example: 27.
        replaced_by (int | None | Unset): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (None | str | Unset): When the resource was replaced in the system. Example: 2024-07-07 10:00:00
            CET.
    """

    service_providing_group_grid_prequalification_id: int
    status: ServiceProvidingGroupGridPrequalificationStatus | Unset = UNSET
    notes: None | str | Unset = UNSET
    prequalified_at: None | str | Unset = UNSET
    service_providing_group_id: int | Unset = UNSET
    impacted_system_operator_id: int | Unset = UNSET
    recorded_at: str | Unset = UNSET
    recorded_by: int | Unset = UNSET
    id: int | Unset = UNSET
    replaced_by: int | None | Unset = UNSET
    replaced_at: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        service_providing_group_grid_prequalification_id = self.service_providing_group_grid_prequalification_id

        status: str | Unset = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        notes: None | str | Unset
        if isinstance(self.notes, Unset):
            notes = UNSET
        else:
            notes = self.notes

        prequalified_at: None | str | Unset
        if isinstance(self.prequalified_at, Unset):
            prequalified_at = UNSET
        else:
            prequalified_at = self.prequalified_at

        service_providing_group_id = self.service_providing_group_id

        impacted_system_operator_id = self.impacted_system_operator_id

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        id = self.id

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
                "service_providing_group_grid_prequalification_id": service_providing_group_grid_prequalification_id,
            }
        )
        if status is not UNSET:
            field_dict["status"] = status
        if notes is not UNSET:
            field_dict["notes"] = notes
        if prequalified_at is not UNSET:
            field_dict["prequalified_at"] = prequalified_at
        if service_providing_group_id is not UNSET:
            field_dict["service_providing_group_id"] = service_providing_group_id
        if impacted_system_operator_id is not UNSET:
            field_dict["impacted_system_operator_id"] = impacted_system_operator_id
        if recorded_at is not UNSET:
            field_dict["recorded_at"] = recorded_at
        if recorded_by is not UNSET:
            field_dict["recorded_by"] = recorded_by
        if id is not UNSET:
            field_dict["id"] = id
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        service_providing_group_grid_prequalification_id = d.pop("service_providing_group_grid_prequalification_id")

        _status = d.pop("status", UNSET)
        status: ServiceProvidingGroupGridPrequalificationStatus | Unset
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = ServiceProvidingGroupGridPrequalificationStatus(_status)

        def _parse_notes(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        notes = _parse_notes(d.pop("notes", UNSET))

        def _parse_prequalified_at(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        prequalified_at = _parse_prequalified_at(d.pop("prequalified_at", UNSET))

        service_providing_group_id = d.pop("service_providing_group_id", UNSET)

        impacted_system_operator_id = d.pop("impacted_system_operator_id", UNSET)

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        id = d.pop("id", UNSET)

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

        service_providing_group_grid_prequalification_history_response = cls(
            service_providing_group_grid_prequalification_id=service_providing_group_grid_prequalification_id,
            status=status,
            notes=notes,
            prequalified_at=prequalified_at,
            service_providing_group_id=service_providing_group_id,
            impacted_system_operator_id=impacted_system_operator_id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            id=id,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
        )

        service_providing_group_grid_prequalification_history_response.additional_properties = d
        return service_providing_group_grid_prequalification_history_response

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
