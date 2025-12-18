from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.entity_business_id_type import EntityBusinessIdType
from ..models.entity_type import EntityType
from ..types import UNSET, Unset

T = TypeVar("T", bound="EntityUpdateRequest")


@_attrs_define
class EntityUpdateRequest:
    """Request schema for update operations - Entity - Natural or legal person

    An entity is a natural or legal person that can be a party in the Flexibility Information System.

    Example entity types:

    * Person
    * Organisation

        Attributes:
            business_id_type (EntityBusinessIdType | Unset): The type of the business identifier. Example: pid.
            name (str | Unset): Name of the entity. Maximum 128 characters. Example: John Smith.
            type_ (EntityType | Unset): The type of the entity, e.g Person, Organisation Example: person.
    """

    business_id_type: EntityBusinessIdType | Unset = UNSET
    name: str | Unset = UNSET
    type_: EntityType | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        business_id_type: str | Unset = UNSET
        if not isinstance(self.business_id_type, Unset):
            business_id_type = self.business_id_type.value

        name = self.name

        type_: str | Unset = UNSET
        if not isinstance(self.type_, Unset):
            type_ = self.type_.value

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if business_id_type is not UNSET:
            field_dict["business_id_type"] = business_id_type
        if name is not UNSET:
            field_dict["name"] = name
        if type_ is not UNSET:
            field_dict["type"] = type_

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        _business_id_type = d.pop("business_id_type", UNSET)
        business_id_type: EntityBusinessIdType | Unset
        if isinstance(_business_id_type, Unset):
            business_id_type = UNSET
        else:
            business_id_type = EntityBusinessIdType(_business_id_type)

        name = d.pop("name", UNSET)

        _type_ = d.pop("type", UNSET)
        type_: EntityType | Unset
        if isinstance(_type_, Unset):
            type_ = UNSET
        else:
            type_ = EntityType(_type_)

        entity_update_request = cls(
            business_id_type=business_id_type,
            name=name,
            type_=type_,
        )

        entity_update_request.additional_properties = d
        return entity_update_request

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
