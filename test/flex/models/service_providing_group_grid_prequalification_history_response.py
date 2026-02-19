from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..models.service_providing_group_grid_prequalification_status import (
    ServiceProvidingGroupGridPrequalificationStatus,
)
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProvidingGroupGridPrequalificationHistoryResponse")


@_attrs_define
class ServiceProvidingGroupGridPrequalificationHistoryResponse:
    """Grid prequalification for service providing group - history

    Attributes:
        id (int): Unique surrogate key. Example: 27.
        service_providing_group_id (int): Reference to the service providing group whose grid prequalification is
            tracked by the current resource. Example: 55.
        impacted_system_operator_id (int): Reference to the `party` that is the impacted system operator. Example: 7.
        status (ServiceProvidingGroupGridPrequalificationStatus): The status of the grid prequalification for this
            service providing group. Example: in_progress.
        recorded_at (datetime.datetime): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31T23:59:00+00:00.
        recorded_by (int): The identity that recorded the resource. Example: 145.
        service_providing_group_grid_prequalification_id (int): Reference to the resource that was updated. Example: 48.
        prequalified_at (datetime.datetime | None | Unset): When the current grid prequalification was last approved.
            Example: 2023-01-08T10:00:00+01.
        replaced_by (int | None | Unset): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (datetime.datetime | None | Unset): When the resource was replaced in the system. Example:
            2024-07-07T10:00:00+00:00.
    """

    id: int
    service_providing_group_id: int
    impacted_system_operator_id: int
    status: ServiceProvidingGroupGridPrequalificationStatus
    recorded_at: datetime.datetime
    recorded_by: int
    service_providing_group_grid_prequalification_id: int
    prequalified_at: datetime.datetime | None | Unset = UNSET
    replaced_by: int | None | Unset = UNSET
    replaced_at: datetime.datetime | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        service_providing_group_id = self.service_providing_group_id

        impacted_system_operator_id = self.impacted_system_operator_id

        status = self.status.value

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        service_providing_group_grid_prequalification_id = self.service_providing_group_grid_prequalification_id

        prequalified_at: None | str | Unset
        if isinstance(self.prequalified_at, Unset):
            prequalified_at = UNSET
        elif isinstance(self.prequalified_at, datetime.datetime):
            prequalified_at = self.prequalified_at.isoformat()
        else:
            prequalified_at = self.prequalified_at

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

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "service_providing_group_id": service_providing_group_id,
                "impacted_system_operator_id": impacted_system_operator_id,
                "status": status,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
                "service_providing_group_grid_prequalification_id": service_providing_group_grid_prequalification_id,
            }
        )
        if prequalified_at is not UNSET:
            field_dict["prequalified_at"] = prequalified_at
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        service_providing_group_id = d.pop("service_providing_group_id")

        impacted_system_operator_id = d.pop("impacted_system_operator_id")

        status = ServiceProvidingGroupGridPrequalificationStatus(d.pop("status"))

        recorded_at = isoparse(d.pop("recorded_at"))

        recorded_by = d.pop("recorded_by")

        service_providing_group_grid_prequalification_id = d.pop("service_providing_group_grid_prequalification_id")

        def _parse_prequalified_at(data: object) -> datetime.datetime | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                prequalified_at_type_0 = isoparse(data)

                return prequalified_at_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.datetime | None | Unset, data)

        prequalified_at = _parse_prequalified_at(d.pop("prequalified_at", UNSET))

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
                replaced_at_type_0 = isoparse(data)

                return replaced_at_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.datetime | None | Unset, data)

        replaced_at = _parse_replaced_at(d.pop("replaced_at", UNSET))

        service_providing_group_grid_prequalification_history_response = cls(
            id=id,
            service_providing_group_id=service_providing_group_id,
            impacted_system_operator_id=impacted_system_operator_id,
            status=status,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            service_providing_group_grid_prequalification_id=service_providing_group_grid_prequalification_id,
            prequalified_at=prequalified_at,
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
