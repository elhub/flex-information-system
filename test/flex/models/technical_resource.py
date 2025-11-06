from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="TechnicalResource")


@_attrs_define
class TechnicalResource:
    """Data schema - Technical unit being part of a controllable unit.

    Attributes:
        name (str | Unset): Name of the technical resource. Maximum 128 characters. Example: Battery Unit #1.
        details (None | str | Unset): Free text details about the technical resource. Example: Make: ACME
            Model: Car Charger 3000.
        controllable_unit_id (int | Unset): Reference to the controllable unit that this technical resource belongs to.
            Example: 37.
        recorded_at (str | Unset): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31 23:59:00 CET.
        recorded_by (int | Unset): The identity that recorded the resource. Example: 145.
        id (int | Unset): Unique surrogate identifier. Example: 89.
    """

    name: str | Unset = UNSET
    details: None | str | Unset = UNSET
    controllable_unit_id: int | Unset = UNSET
    recorded_at: str | Unset = UNSET
    recorded_by: int | Unset = UNSET
    id: int | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        name = self.name

        details: None | str | Unset
        if isinstance(self.details, Unset):
            details = UNSET
        else:
            details = self.details

        controllable_unit_id = self.controllable_unit_id

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        id = self.id

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if name is not UNSET:
            field_dict["name"] = name
        if details is not UNSET:
            field_dict["details"] = details
        if controllable_unit_id is not UNSET:
            field_dict["controllable_unit_id"] = controllable_unit_id
        if recorded_at is not UNSET:
            field_dict["recorded_at"] = recorded_at
        if recorded_by is not UNSET:
            field_dict["recorded_by"] = recorded_by
        if id is not UNSET:
            field_dict["id"] = id

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        name = d.pop("name", UNSET)

        def _parse_details(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        details = _parse_details(d.pop("details", UNSET))

        controllable_unit_id = d.pop("controllable_unit_id", UNSET)

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        id = d.pop("id", UNSET)

        technical_resource = cls(
            name=name,
            details=details,
            controllable_unit_id=controllable_unit_id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            id=id,
        )

        technical_resource.additional_properties = d
        return technical_resource

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
