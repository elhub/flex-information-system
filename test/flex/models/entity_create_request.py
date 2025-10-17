from collections.abc import Mapping
from typing import Any, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="EntityCreateRequest")


@_attrs_define
class EntityCreateRequest:
    """Request schema for create operations - Entity - Natural or legal person

    An entity is a natural or legal person that can be a party in the Flexibility Information System.

    Example entity types:

    * Person
    * Organisation

        Attributes:
            name (Union[Unset, str]): Name of the entity. Maximum 128 characters. Example: John Smith.
            business_id (Union[Unset, str]): The business identifier of the entity. Format depends on `business_id_type`.
                Example: 13370000000.
            business_id_type (Union[Unset, str]): The type of the business identifier. Example: pid.
            type_ (Union[Unset, str]): The type of the entity, e.g Person, Organisation Example: person.
    """

    name: Union[Unset, str] = UNSET
    business_id: Union[Unset, str] = UNSET
    business_id_type: Union[Unset, str] = UNSET
    type_: Union[Unset, str] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        name = self.name

        business_id = self.business_id

        business_id_type = self.business_id_type

        type_ = self.type_

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

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        name = d.pop("name", UNSET)

        business_id = d.pop("business_id", UNSET)

        business_id_type = d.pop("business_id_type", UNSET)

        type_ = d.pop("type", UNSET)

        entity_create_request = cls(
            name=name,
            business_id=business_id,
            business_id_type=business_id_type,
            type_=type_,
        )

        entity_create_request.additional_properties = d
        return entity_create_request

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
