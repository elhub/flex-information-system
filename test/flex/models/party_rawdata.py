from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.party_business_id_type import PartyBusinessIdType
from ..models.party_status import PartyStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="PartyRawdata")


@_attrs_define
class PartyRawdata:
    """Raw data for embedding - The body that interacts with the Flexibility Information System

    A party is the thing that is authorized to access or modify data in the Flexiblity Information System.

    Example party types:

    * Service Provider
    * System Operator
    * End User

        Attributes:
            id (Union[None, Unset, int]): Unique surrogate identifier. Example: 11.
            business_id (Union[None, Unset, str]): The business identifier of the party. Format depends on
                `business_id_type`. Example: 1337099000000.
            business_id_type (Union[Unset, PartyBusinessIdType]): The type of the business identifier. Example: gln.
            entity_id (Union[None, Unset, int]): Reference to the entity that is the parent of the party. Example: 30.
            name (Union[None, Unset, str]): Name of the party. Maximum 128 characters. Example: Flex Energy Supplier.
            role (Union[None, Unset, str]): The role of the party. Currently maps to 1:1 to `type`. E.g. system_operator,
                service_provider. Example: flex_energy_supplier.
            type (Union[None, Unset, str]): The type of the party, e.g SystemOperator, ServiceProvider Example:
                energy_supplier.
            status (Union[Unset, PartyStatus]): The status of the party. Example: active.
            recorded_at (Union[None, Unset, str]): When the resource was recorded (created or updated) in the system.
                Example: 2023-12-31 23:59:00 CET.
            recorded_by (Union[None, Unset, int]): The identity that recorded the resource. Example: 145.
    """

    id: Union[None, Unset, int] = UNSET
    business_id: Union[None, Unset, str] = UNSET
    business_id_type: Union[Unset, PartyBusinessIdType] = UNSET
    entity_id: Union[None, Unset, int] = UNSET
    name: Union[None, Unset, str] = UNSET
    role: Union[None, Unset, str] = UNSET
    type: Union[None, Unset, str] = UNSET
    status: Union[Unset, PartyStatus] = UNSET
    recorded_at: Union[None, Unset, str] = UNSET
    recorded_by: Union[None, Unset, int] = UNSET
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

        business_id_type: Union[Unset, str] = UNSET
        if not isinstance(self.business_id_type, Unset):
            business_id_type = self.business_id_type.value

        entity_id: Union[None, Unset, int]
        if isinstance(self.entity_id, Unset):
            entity_id = UNSET
        else:
            entity_id = self.entity_id

        name: Union[None, Unset, str]
        if isinstance(self.name, Unset):
            name = UNSET
        else:
            name = self.name

        role: Union[None, Unset, str]
        if isinstance(self.role, Unset):
            role = UNSET
        else:
            role = self.role

        type: Union[None, Unset, str]
        if isinstance(self.type, Unset):
            type = UNSET
        else:
            type = self.type

        status: Union[Unset, str] = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        recorded_at: Union[None, Unset, str]
        if isinstance(self.recorded_at, Unset):
            recorded_at = UNSET
        else:
            recorded_at = self.recorded_at

        recorded_by: Union[None, Unset, int]
        if isinstance(self.recorded_by, Unset):
            recorded_by = UNSET
        else:
            recorded_by = self.recorded_by

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if id is not UNSET:
            field_dict["id"] = id
        if business_id is not UNSET:
            field_dict["business_id"] = business_id
        if business_id_type is not UNSET:
            field_dict["business_id_type"] = business_id_type
        if entity_id is not UNSET:
            field_dict["entity_id"] = entity_id
        if name is not UNSET:
            field_dict["name"] = name
        if role is not UNSET:
            field_dict["role"] = role
        if type is not UNSET:
            field_dict["type"] = type
        if status is not UNSET:
            field_dict["status"] = status
        if recorded_at is not UNSET:
            field_dict["recorded_at"] = recorded_at
        if recorded_by is not UNSET:
            field_dict["recorded_by"] = recorded_by

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

        _business_id_type = d.pop("business_id_type", UNSET)
        business_id_type: Union[Unset, PartyBusinessIdType]
        if isinstance(_business_id_type, Unset):
            business_id_type = UNSET
        else:
            business_id_type = PartyBusinessIdType(_business_id_type)

        def _parse_entity_id(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        entity_id = _parse_entity_id(d.pop("entity_id", UNSET))

        def _parse_name(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        name = _parse_name(d.pop("name", UNSET))

        def _parse_role(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        role = _parse_role(d.pop("role", UNSET))

        def _parse_type(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        type = _parse_type(d.pop("type", UNSET))

        _status = d.pop("status", UNSET)
        status: Union[Unset, PartyStatus]
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = PartyStatus(_status)

        def _parse_recorded_at(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        recorded_at = _parse_recorded_at(d.pop("recorded_at", UNSET))

        def _parse_recorded_by(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        recorded_by = _parse_recorded_by(d.pop("recorded_by", UNSET))

        party_rawdata = cls(
            id=id,
            business_id=business_id,
            business_id_type=business_id_type,
            entity_id=entity_id,
            name=name,
            role=role,
            type=type,
            status=status,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
        )

        party_rawdata.additional_properties = d
        return party_rawdata

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
