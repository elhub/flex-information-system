from typing import Any, Dict, List, Type, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.party_business_id_type import PartyBusinessIdType
from ..models.party_status import PartyStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="PartyCreateData")


@_attrs_define
class PartyCreateData:
    """Data of the request schema for create operations - The body that interacts with the Flexibility Information System

    A party is the thing that is authorized to access or modify data in the Flexiblity Information System.

    Example party types:

    * Service Provider
    * System Operator
    * End User

        Attributes:
            business_id_type (Union[Unset, PartyBusinessIdType]): The type of the business identifier. Example: gln.
            name (Union[Unset, str]): Name of the party. Maximum 128 characters. Example: Flex Energy Supplier.
            status (Union[Unset, PartyStatus]): The status of the party. Example: active.
            business_id (Union[Unset, str]): The business identifier of the party. Format depends on `business_id_type`.
                Example: 1337099000000.
            entity_id (Union[Unset, int]): Reference to the entity that is the parent of the party. Example: 30.
            role (Union[Unset, str]): The role of the party. Currently maps to 1:1 to `type`. E.g. system_operator,
                service_provider. Example: flex_energy_supplier.
            type (Union[Unset, str]): The type of the party, e.g SystemOperator, ServiceProvider Example: energy_supplier.
    """

    business_id_type: Union[Unset, PartyBusinessIdType] = UNSET
    name: Union[Unset, str] = UNSET
    status: Union[Unset, PartyStatus] = UNSET
    business_id: Union[Unset, str] = UNSET
    entity_id: Union[Unset, int] = UNSET
    role: Union[Unset, str] = UNSET
    type: Union[Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        business_id_type: Union[Unset, str] = UNSET
        if not isinstance(self.business_id_type, Unset):
            business_id_type = self.business_id_type.value

        name = self.name

        status: Union[Unset, str] = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        business_id = self.business_id

        entity_id = self.entity_id

        role = self.role

        type = self.type

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if business_id_type is not UNSET:
            field_dict["business_id_type"] = business_id_type
        if name is not UNSET:
            field_dict["name"] = name
        if status is not UNSET:
            field_dict["status"] = status
        if business_id is not UNSET:
            field_dict["business_id"] = business_id
        if entity_id is not UNSET:
            field_dict["entity_id"] = entity_id
        if role is not UNSET:
            field_dict["role"] = role
        if type is not UNSET:
            field_dict["type"] = type

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        _business_id_type = d.pop("business_id_type", UNSET)
        business_id_type: Union[Unset, PartyBusinessIdType]
        if isinstance(_business_id_type, Unset):
            business_id_type = UNSET
        else:
            business_id_type = PartyBusinessIdType(_business_id_type)

        name = d.pop("name", UNSET)

        _status = d.pop("status", UNSET)
        status: Union[Unset, PartyStatus]
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = PartyStatus(_status)

        business_id = d.pop("business_id", UNSET)

        entity_id = d.pop("entity_id", UNSET)

        role = d.pop("role", UNSET)

        type = d.pop("type", UNSET)

        party_create_data = cls(
            business_id_type=business_id_type,
            name=name,
            status=status,
            business_id=business_id,
            entity_id=entity_id,
            role=role,
            type=type,
        )

        party_create_data.additional_properties = d
        return party_create_data

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
