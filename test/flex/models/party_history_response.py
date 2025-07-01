from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.party_business_id_type import PartyBusinessIdType
from ..models.party_status import PartyStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="PartyHistoryResponse")


@_attrs_define
class PartyHistoryResponse:
    """Party - history

    Attributes:
        party_id (int): Reference to the resource that was updated. Example: 48.
        business_id_type (Union[Unset, PartyBusinessIdType]): The type of the business identifier. Example: gln.
        name (Union[Unset, str]): Name of the party. Maximum 128 characters. Example: Flex Energy Supplier.
        status (Union[Unset, PartyStatus]): The status of the party. Example: active.
        business_id (Union[Unset, str]): The business identifier of the party. Format depends on `business_id_type`.
            Example: 1337099000000.
        entity_id (Union[Unset, int]): Reference to the entity that is the parent of the party. Example: 30.
        role (Union[Unset, str]): The role of the party. Currently maps to 1:1 to `type`. E.g. system_operator,
            service_provider. Example: flex_energy_supplier.
        type (Union[Unset, str]): The type of the party, e.g SystemOperator, ServiceProvider Example: energy_supplier.
        recorded_at (Union[Unset, str]): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31 23:59:00 CET.
        recorded_by (Union[Unset, int]): The identity that recorded the resource. Example: 145.
        id (Union[Unset, int]): Unique surrogate identifier. Example: 11.
        replaced_by (Union[None, Unset, int]): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (Union[None, Unset, str]): When the resource was replaced in the system. Example: 2024-07-07
            10:00:00 CET.
    """

    party_id: int
    business_id_type: Union[Unset, PartyBusinessIdType] = UNSET
    name: Union[Unset, str] = UNSET
    status: Union[Unset, PartyStatus] = UNSET
    business_id: Union[Unset, str] = UNSET
    entity_id: Union[Unset, int] = UNSET
    role: Union[Unset, str] = UNSET
    type: Union[Unset, str] = UNSET
    recorded_at: Union[Unset, str] = UNSET
    recorded_by: Union[Unset, int] = UNSET
    id: Union[Unset, int] = UNSET
    replaced_by: Union[None, Unset, int] = UNSET
    replaced_at: Union[None, Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        party_id = self.party_id

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

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        id = self.id

        replaced_by: Union[None, Unset, int]
        if isinstance(self.replaced_by, Unset):
            replaced_by = UNSET
        else:
            replaced_by = self.replaced_by

        replaced_at: Union[None, Unset, str]
        if isinstance(self.replaced_at, Unset):
            replaced_at = UNSET
        else:
            replaced_at = self.replaced_at

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "party_id": party_id,
            }
        )
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
        if recorded_at is not UNSET:
            field_dict["recorded_at"] = recorded_at
        if recorded_by is not UNSET:
            field_dict["recorded_by"] = recorded_by
        if id is not UNSET:
            field_dict["id"] = id
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        party_id = d.pop("party_id")

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

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        id = d.pop("id", UNSET)

        def _parse_replaced_by(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        replaced_by = _parse_replaced_by(d.pop("replaced_by", UNSET))

        def _parse_replaced_at(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        replaced_at = _parse_replaced_at(d.pop("replaced_at", UNSET))

        party_history_response = cls(
            party_id=party_id,
            business_id_type=business_id_type,
            name=name,
            status=status,
            business_id=business_id,
            entity_id=entity_id,
            role=role,
            type=type,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            id=id,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
        )

        party_history_response.additional_properties = d
        return party_history_response

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
