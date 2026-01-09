from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.party_business_id_type import PartyBusinessIdType
from ..models.party_role import PartyRole
from ..models.party_status import PartyStatus
from ..models.party_type import PartyType
from ..types import UNSET, Unset

T = TypeVar("T", bound="PartyCreateRequest")


@_attrs_define
class PartyCreateRequest:
    """Request schema for create operations - The body that interacts with the Flexibility Information System

    A party is the thing that is authorized to access or modify data in the Flexiblity Information System.

    Example party types:

    * Service Provider
    * System Operator
    * End User

        Attributes:
            entity_id (int): Reference to the entity that is the parent of the party. Example: 30.
            name (str): Name of the party. Maximum 128 characters. Example: Flex Energy Supplier.
            role (PartyRole): The role of the party. Currently maps to 1:1 to `type`. E.g. system_operator,
                service_provider. Example: flex_energy_supplier.
            type_ (PartyType): The type of the party, e.g SystemOperator, ServiceProvider Example: energy_supplier.
            business_id (str | Unset): The business identifier of the party. Format depends on `business_id_type`. Example:
                1337099000000.
            business_id_type (PartyBusinessIdType | Unset): The type of the business identifier. Example: gln.
            status (PartyStatus | Unset): The status of the party. Example: active.
    """

    entity_id: int
    name: str
    role: PartyRole
    type_: PartyType
    business_id: str | Unset = UNSET
    business_id_type: PartyBusinessIdType | Unset = UNSET
    status: PartyStatus | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        entity_id = self.entity_id

        name = self.name

        role = self.role.value

        type_ = self.type_.value

        business_id = self.business_id

        business_id_type: str | Unset = UNSET
        if not isinstance(self.business_id_type, Unset):
            business_id_type = self.business_id_type.value

        status: str | Unset = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "entity_id": entity_id,
                "name": name,
                "role": role,
                "type": type_,
            }
        )
        if business_id is not UNSET:
            field_dict["business_id"] = business_id
        if business_id_type is not UNSET:
            field_dict["business_id_type"] = business_id_type
        if status is not UNSET:
            field_dict["status"] = status

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        entity_id = d.pop("entity_id")

        name = d.pop("name")

        role = PartyRole(d.pop("role"))

        type_ = PartyType(d.pop("type"))

        business_id = d.pop("business_id", UNSET)

        _business_id_type = d.pop("business_id_type", UNSET)
        business_id_type: PartyBusinessIdType | Unset
        if isinstance(_business_id_type, Unset):
            business_id_type = UNSET
        else:
            business_id_type = PartyBusinessIdType(_business_id_type)

        _status = d.pop("status", UNSET)
        status: PartyStatus | Unset
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = PartyStatus(_status)

        party_create_request = cls(
            entity_id=entity_id,
            name=name,
            role=role,
            type_=type_,
            business_id=business_id,
            business_id_type=business_id_type,
            status=status,
        )

        party_create_request.additional_properties = d
        return party_create_request

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
