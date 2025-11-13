from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="Entity")


@_attrs_define
class Entity:
    """Data schema - Entity - Natural or legal person

    An entity is a natural or legal person that can be a party in the Flexibility Information System.

    Example entity types:

    * Person
    * Organisation

        Attributes:
            name (str | Unset): Name of the entity. Maximum 128 characters. Example: John Smith.
            business_id (str | Unset): The business identifier of the entity. Format depends on `business_id_type`. Example:
                13370000000.
            business_id_type (str | Unset): The type of the business identifier. Example: pid.
            type_ (str | Unset): The type of the entity, e.g Person, Organisation Example: person.
            recorded_at (str | Unset): When the resource was recorded (created or updated) in the system. Example:
                2023-12-31 23:59:00 CET.
            recorded_by (int | Unset): The identity that recorded the resource. Example: 145.
            id (int | Unset): Unique surrogate identifier.

                Note:
                This is a Primary Key. Example: 14.
    """

    name: str | Unset = UNSET
    business_id: str | Unset = UNSET
    business_id_type: str | Unset = UNSET
    type_: str | Unset = UNSET
    recorded_at: str | Unset = UNSET
    recorded_by: int | Unset = UNSET
    id: int | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        name = self.name

        business_id = self.business_id

        business_id_type = self.business_id_type

        type_ = self.type_

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        id = self.id

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if name is not UNSET:
            field_dict["name"] = name
        if business_id is not UNSET:
            field_dict["business_id"] = business_id
        if business_id_type is not UNSET:
            field_dict["business_id_type"] = business_id_type
        if type_ is not UNSET:
            field_dict["type"] = type_
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

        business_id = d.pop("business_id", UNSET)

        business_id_type = d.pop("business_id_type", UNSET)

        type_ = d.pop("type", UNSET)

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        id = d.pop("id", UNSET)

        entity = cls(
            name=name,
            business_id=business_id,
            business_id_type=business_id_type,
            type_=type_,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            id=id,
        )

        entity.additional_properties = d
        return entity

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
