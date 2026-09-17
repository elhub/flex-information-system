from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProvidingGroupControllableUnitsApplicationsResponseGridPrequalification")


@_attrs_define
class ServiceProvidingGroupControllableUnitsApplicationsResponseGridPrequalification:
    """Details about the grid prequalification for this controllable unit

    Attributes:
        id (int | Unset): The surrogate key of the grid prequalification Example: 123.
        prequalified_at (datetime.datetime | Unset): When the prequalification was completed, null if not Example:
            2023-01-01T00:00:00+00:00.
    """

    id: int | Unset = UNSET
    prequalified_at: datetime.datetime | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        prequalified_at: str | Unset = UNSET
        if not isinstance(self.prequalified_at, Unset):
            prequalified_at = self.prequalified_at.isoformat()

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if id is not UNSET:
            field_dict["id"] = id
        if prequalified_at is not UNSET:
            field_dict["prequalified_at"] = prequalified_at

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id", UNSET)

        _prequalified_at = d.pop("prequalified_at", UNSET)
        prequalified_at: datetime.datetime | Unset
        if isinstance(_prequalified_at, Unset):
            prequalified_at = UNSET
        else:
            prequalified_at = datetime.datetime.fromisoformat(_prequalified_at)

        service_providing_group_controllable_units_applications_response_grid_prequalification = cls(
            id=id,
            prequalified_at=prequalified_at,
        )

        service_providing_group_controllable_units_applications_response_grid_prequalification.additional_properties = d
        return service_providing_group_controllable_units_applications_response_grid_prequalification

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
