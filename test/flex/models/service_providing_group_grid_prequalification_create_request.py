from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_grid_prequalification_status import (
    ServiceProvidingGroupGridPrequalificationStatus,
)
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProvidingGroupGridPrequalificationCreateRequest")


@_attrs_define
class ServiceProvidingGroupGridPrequalificationCreateRequest:
    """Request schema for create operations - Grid prequalification for service providing group

    Attributes:
        status (ServiceProvidingGroupGridPrequalificationStatus | Unset): The status of the grid prequalification for
            this service providing group. Example: in_progress.
        notes (None | str | Unset): Free text notes on the current prequalification status.
        prequalified_at (None | str | Unset): When the current grid prequalification was last approved. Example:
            2023-01-08 10:00:00 CET.
        service_providing_group_id (int | Unset): Reference to the service providing group whose grid prequalification
            is tracked by the current resource. Example: 55.
        impacted_system_operator_id (int | Unset): Reference to the `party` that is the impacted system operator.
            Example: 7.
    """

    status: ServiceProvidingGroupGridPrequalificationStatus | Unset = UNSET
    notes: None | str | Unset = UNSET
    prequalified_at: None | str | Unset = UNSET
    service_providing_group_id: int | Unset = UNSET
    impacted_system_operator_id: int | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
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

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
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

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
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

        service_providing_group_grid_prequalification_create_request = cls(
            status=status,
            notes=notes,
            prequalified_at=prequalified_at,
            service_providing_group_id=service_providing_group_id,
            impacted_system_operator_id=impacted_system_operator_id,
        )

        service_providing_group_grid_prequalification_create_request.additional_properties = d
        return service_providing_group_grid_prequalification_create_request

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
