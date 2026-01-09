from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_grid_prequalification_status import (
    ServiceProvidingGroupGridPrequalificationStatus,
)
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProvidingGroupGridPrequalification")


@_attrs_define
class ServiceProvidingGroupGridPrequalification:
    """Data schema - Grid prequalification for service providing group

    Attributes:
        id (int): Unique surrogate key. Example: 27.
        service_providing_group_id (int): Reference to the service providing group whose grid prequalification is
            tracked by the current resource. Example: 55.
        impacted_system_operator_id (int): Reference to the `party` that is the impacted system operator. Example: 7.
        status (ServiceProvidingGroupGridPrequalificationStatus): The status of the grid prequalification for this
            service providing group. Example: in_progress.
        recorded_at (str): When the resource was recorded (created or updated) in the system. Example: 2023-12-31
            23:59:00 CET.
        recorded_by (int): The identity that recorded the resource. Example: 145.
        prequalified_at (None | str | Unset): When the current grid prequalification was last approved. Example:
            2023-01-08 10:00:00 CET.
    """

    id: int
    service_providing_group_id: int
    impacted_system_operator_id: int
    status: ServiceProvidingGroupGridPrequalificationStatus
    recorded_at: str
    recorded_by: int
    prequalified_at: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        service_providing_group_id = self.service_providing_group_id

        impacted_system_operator_id = self.impacted_system_operator_id

        status = self.status.value

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        prequalified_at: None | str | Unset
        if isinstance(self.prequalified_at, Unset):
            prequalified_at = UNSET
        else:
            prequalified_at = self.prequalified_at

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
            }
        )
        if prequalified_at is not UNSET:
            field_dict["prequalified_at"] = prequalified_at

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        service_providing_group_id = d.pop("service_providing_group_id")

        impacted_system_operator_id = d.pop("impacted_system_operator_id")

        status = ServiceProvidingGroupGridPrequalificationStatus(d.pop("status"))

        recorded_at = d.pop("recorded_at")

        recorded_by = d.pop("recorded_by")

        def _parse_prequalified_at(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        prequalified_at = _parse_prequalified_at(d.pop("prequalified_at", UNSET))

        service_providing_group_grid_prequalification = cls(
            id=id,
            service_providing_group_id=service_providing_group_id,
            impacted_system_operator_id=impacted_system_operator_id,
            status=status,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            prequalified_at=prequalified_at,
        )

        service_providing_group_grid_prequalification.additional_properties = d
        return service_providing_group_grid_prequalification

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
