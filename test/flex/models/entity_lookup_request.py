from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.entity_lookup_request_business_id_type import EntityLookupRequestBusinessIdType
from ..models.entity_lookup_request_type import EntityLookupRequestType

T = TypeVar("T", bound="EntityLookupRequest")


@_attrs_define
class EntityLookupRequest:
    """Request schema for entity lookup operations

    Attributes:
        business_id (str): The business identifier of the entity. Email address or organisation number, according to
            `business_id_type`. Example: john.smith@example.com.
        business_id_type (EntityLookupRequestBusinessIdType): The type of business identifier. For persons, `email`. For
            organisations, `org` (organisation number, 9 digits). Example: email.
        name (str): Name of the entity. Example: John Smith.
        type_ (EntityLookupRequestType): The type of the entity. Example: person.
    """

    business_id: str
    business_id_type: EntityLookupRequestBusinessIdType
    name: str
    type_: EntityLookupRequestType
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        business_id = self.business_id

        business_id_type = self.business_id_type.value

        name = self.name

        type_ = self.type_.value

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "business_id": business_id,
                "business_id_type": business_id_type,
                "name": name,
                "type": type_,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        business_id = d.pop("business_id")

        business_id_type = EntityLookupRequestBusinessIdType(d.pop("business_id_type"))

        name = d.pop("name")

        type_ = EntityLookupRequestType(d.pop("type"))

        entity_lookup_request = cls(
            business_id=business_id,
            business_id_type=business_id_type,
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
