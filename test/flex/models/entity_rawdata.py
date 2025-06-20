from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="EntityRawdata")


@_attrs_define
class EntityRawdata:
    """Raw data for embedding - Entity - Natural or legal person

    An entity is a natural or legal person that can be a party in the Flexibility Information System.

    Example entity types:

    * Person
    * Organisation

        Attributes:
            id (Union[None, Unset, int]): Unique surrogate identifier.

                Note:
                This is a Primary Key. Example: 14.
            business_id (Union[None, Unset, str]): The business identifier of the entity. Format depends on
                `business_id_type`. Example: 13370000000.
            business_id_type (Union[None, Unset, str]): The type of the business identifier. Example: pid.
            name (Union[None, Unset, str]): Name of the entity. Maximum 128 characters. Example: John Smith.
            type (Union[None, Unset, str]): The type of the entity, e.g Person, Organisation Example: person.
    """

    id: Union[None, Unset, int] = UNSET
    business_id: Union[None, Unset, str] = UNSET
    business_id_type: Union[None, Unset, str] = UNSET
    name: Union[None, Unset, str] = UNSET
    type: Union[None, Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        id: Union[None, Unset, int]
        if isinstance(self.id, Unset):
            id = UNSET
        else:
            id = self.id

        business_id: Union[None, Unset, str]
        if isinstance(self.business_id, Unset):
            business_id = UNSET
        else:
            business_id = self.business_id

        business_id_type: Union[None, Unset, str]
        if isinstance(self.business_id_type, Unset):
            business_id_type = UNSET
        else:
            business_id_type = self.business_id_type

        name: Union[None, Unset, str]
        if isinstance(self.name, Unset):
            name = UNSET
        else:
            name = self.name

        type: Union[None, Unset, str]
        if isinstance(self.type, Unset):
            type = UNSET
        else:
            type = self.type

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if id is not UNSET:
            field_dict["id"] = id
        if business_id is not UNSET:
            field_dict["business_id"] = business_id
        if business_id_type is not UNSET:
            field_dict["business_id_type"] = business_id_type
        if name is not UNSET:
            field_dict["name"] = name
        if type is not UNSET:
            field_dict["type"] = type

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()

        def _parse_id(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        id = _parse_id(d.pop("id", UNSET))

        def _parse_business_id(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        business_id = _parse_business_id(d.pop("business_id", UNSET))

        def _parse_business_id_type(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        business_id_type = _parse_business_id_type(d.pop("business_id_type", UNSET))

        def _parse_name(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        name = _parse_name(d.pop("name", UNSET))

        def _parse_type(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        type = _parse_type(d.pop("type", UNSET))

        entity_rawdata = cls(
            id=id,
            business_id=business_id,
            business_id_type=business_id_type,
            name=name,
            type=type,
        )

        entity_rawdata.additional_properties = d
        return entity_rawdata

    @property
    def additional_keys(self) -> List[str]:
        return list(self.additional_properties.keys())

    def __getitem__(self, key: str) -> Any:
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: Any) -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties
