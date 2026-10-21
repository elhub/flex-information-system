from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import Any, Literal, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="NoticeDataServiceProvidingGroupGridPrequalificationOutdated")


@_attrs_define
class NoticeDataServiceProvidingGroupGridPrequalificationOutdated:
    """Format of the data field in a notice with data.kind =
    notice.data.service_providing_group_grid_prequalification.outdated

        Attributes:
            kind (Literal['notice.data.service_providing_group_grid_prequalification.outdated']): Identifies the notice data
                schema for discriminated union deserialization.
            service_providing_group_id (int | Unset): The service providing group that changed. Example: 5.
            prequalified_at (datetime.datetime | Unset): When the service providing group was last grid prequalified. The
                changes are computed relative to the state at this time. Example: 2023-01-08T10:00:00+01.
            added (int | Unset): Number of controllable units added since the grid prequalification. Example: 2.
            removed (int | Unset): Number of controllable units removed since the grid prequalification. Example: 1.
            changed (int | Unset): Number of controllable units whose maximum active power changed since the grid
                prequalification. Example: 0.
            maximum_active_power_diff (float | Unset): Net change in maximum active power (kW) of the controllable units
                under the system operator since the grid prequalification. Example: 75.5.
    """

    kind: Literal["notice.data.service_providing_group_grid_prequalification.outdated"]
    service_providing_group_id: int | Unset = UNSET
    prequalified_at: datetime.datetime | Unset = UNSET
    added: int | Unset = UNSET
    removed: int | Unset = UNSET
    changed: int | Unset = UNSET
    maximum_active_power_diff: float | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        kind = self.kind

        service_providing_group_id = self.service_providing_group_id

        prequalified_at: str | Unset = UNSET
        if not isinstance(self.prequalified_at, Unset):
            prequalified_at = self.prequalified_at.isoformat()

        added = self.added

        removed = self.removed

        changed = self.changed

        maximum_active_power_diff = self.maximum_active_power_diff

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "kind": kind,
            }
        )
        if service_providing_group_id is not UNSET:
            field_dict["service_providing_group_id"] = service_providing_group_id
        if prequalified_at is not UNSET:
            field_dict["prequalified_at"] = prequalified_at
        if added is not UNSET:
            field_dict["added"] = added
        if removed is not UNSET:
            field_dict["removed"] = removed
        if changed is not UNSET:
            field_dict["changed"] = changed
        if maximum_active_power_diff is not UNSET:
            field_dict["maximum_active_power_diff"] = maximum_active_power_diff

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        kind = cast(Literal["notice.data.service_providing_group_grid_prequalification.outdated"], d.pop("kind"))
        if kind != "notice.data.service_providing_group_grid_prequalification.outdated":
            raise ValueError(
                f"kind must match const 'notice.data.service_providing_group_grid_prequalification.outdated', got '{kind}'"
            )

        service_providing_group_id = d.pop("service_providing_group_id", UNSET)

        _prequalified_at = d.pop("prequalified_at", UNSET)
        prequalified_at: datetime.datetime | Unset
        if isinstance(_prequalified_at, Unset):
            prequalified_at = UNSET
        else:
            prequalified_at = datetime.datetime.fromisoformat(_prequalified_at)

        added = d.pop("added", UNSET)

        removed = d.pop("removed", UNSET)

        changed = d.pop("changed", UNSET)

        maximum_active_power_diff = d.pop("maximum_active_power_diff", UNSET)

        notice_data_service_providing_group_grid_prequalification_outdated = cls(
            kind=kind,
            service_providing_group_id=service_providing_group_id,
            prequalified_at=prequalified_at,
            added=added,
            removed=removed,
            changed=changed,
            maximum_active_power_diff=maximum_active_power_diff,
        )

        notice_data_service_providing_group_grid_prequalification_outdated.additional_properties = d
        return notice_data_service_providing_group_grid_prequalification_outdated

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
