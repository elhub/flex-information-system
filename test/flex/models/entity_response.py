from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.entity_business_id_type import EntityBusinessIdType
from ..models.entity_type import EntityType

T = TypeVar("T", bound="EntityResponse")


@_attrs_define
class EntityResponse:
    """Response schema - Entity - Natural or legal person

    An entity is a natural or legal person that can be a party in the Flexibility Information System.

    Example entity types:

    * Person
    * Organisation

        Attributes:
            id (int): Unique surrogate identifier.

                Note:
                This is a Primary Key. Example: 14.
            business_id (str): The business identifier of the entity. Format depends on `business_id_type`. Example:
                13370000000.
            business_id_type (EntityBusinessIdType): The type of the business identifier. Example: pid.
            name (str): Name of the entity. Maximum 128 characters. Example: John Smith.
            type_ (EntityType): The type of the entity, e.g Person, Organisation Example: person.
            recorded_at (str): When the resource was recorded (created or updated) in the system. Example: 2023-12-31
                23:59:00 CET.
            recorded_by (int): The identity that recorded the resource. Example: 145.
    """

    id: int
    business_id: str
    business_id_type: EntityBusinessIdType
    name: str
    type_: EntityType
    recorded_at: str
    recorded_by: int
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        business_id = self.business_id

        business_id_type = self.business_id_type.value

        name = self.name

        type_ = self.type_.value

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "business_id": business_id,
                "business_id_type": business_id_type,
                "name": name,
                "type": type_,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        business_id = d.pop("business_id")

        business_id_type = EntityBusinessIdType(d.pop("business_id_type"))

        name = d.pop("name")

        type_ = EntityType(d.pop("type"))

        recorded_at = d.pop("recorded_at")

        recorded_by = d.pop("recorded_by")

        entity_response = cls(
            id=id,
            business_id=business_id,
            business_id_type=business_id_type,
            name=name,
            type_=type_,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
        )

        entity_response.additional_properties = d
        return entity_response

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
