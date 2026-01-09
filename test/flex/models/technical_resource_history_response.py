from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="TechnicalResourceHistoryResponse")


@_attrs_define
class TechnicalResourceHistoryResponse:
    """History response schema - Technical unit being part of a controllable unit.

    Attributes:
        id (int): Unique surrogate identifier. Example: 89.
        name (str): Name of the technical resource. Maximum 128 characters. Example: Battery Unit #1.
        controllable_unit_id (int): Reference to the controllable unit that this technical resource belongs to. Example:
            37.
        recorded_at (str): When the resource was recorded (created or updated) in the system. Example: 2023-12-31
            23:59:00 CET.
        recorded_by (int): The identity that recorded the resource. Example: 145.
        technical_resource_id (int): Reference to the resource that was updated. Example: 48.
        details (None | str | Unset): Free text details about the technical resource. Example: Make: ACME
            Model: Car Charger 3000.
        replaced_by (int | None | Unset): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (None | str | Unset): When the resource was replaced in the system. Example: 2024-07-07 10:00:00
            CET.
    """

    id: int
    name: str
    controllable_unit_id: int
    recorded_at: str
    recorded_by: int
    technical_resource_id: int
    details: None | str | Unset = UNSET
    replaced_by: int | None | Unset = UNSET
    replaced_at: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        name = self.name

        controllable_unit_id = self.controllable_unit_id

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        technical_resource_id = self.technical_resource_id

        details: None | str | Unset
        if isinstance(self.details, Unset):
            details = UNSET
        else:
            details = self.details

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
                "id": id,
                "name": name,
                "controllable_unit_id": controllable_unit_id,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
                "technical_resource_id": technical_resource_id,
            }
        )
        if details is not UNSET:
            field_dict["details"] = details
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        name = d.pop("name")

        controllable_unit_id = d.pop("controllable_unit_id")

        recorded_at = d.pop("recorded_at")

        recorded_by = d.pop("recorded_by")

        technical_resource_id = d.pop("technical_resource_id")

        def _parse_details(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        details = _parse_details(d.pop("details", UNSET))

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

        technical_resource_history_response = cls(
            id=id,
            name=name,
            controllable_unit_id=controllable_unit_id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            technical_resource_id=technical_resource_id,
            details=details,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
        )

        technical_resource_history_response.additional_properties = d
        return technical_resource_history_response

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
