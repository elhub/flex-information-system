from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.entity_lookup_request_type import EntityLookupRequestType

T = TypeVar("T", bound="EntityLookupRequest")


@_attrs_define
class EntityLookupRequest:
    """Request schema for entity lookup operations

    Attributes:
        business_id (str): The business identifier of the entity. Person number or organisation number, according to
            `type`. Example: 13370000000.
        name (str): Name of the entity. Example: John Smith.
        type_ (EntityLookupRequestType): The type of the entity. Example: person.
    """

    business_id: str
    name: str
    type_: EntityLookupRequestType
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        business_id = self.business_id

        name = self.name

        type_ = self.type_.value

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "business_id": business_id,
                "name": name,
                "type": type_,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        business_id = d.pop("business_id")

        name = d.pop("name")

        type_ = EntityLookupRequestType(d.pop("type"))

        entity_lookup_request = cls(
            business_id=business_id,
            name=name,
            type_=type_,
        )

        entity_lookup_request.additional_properties = d
        return entity_lookup_request

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
