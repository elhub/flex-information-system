from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.party_business_id_type import PartyBusinessIdType
from ..models.party_status import PartyStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="Party")


@_attrs_define
class Party:
    """Data schema - The body that interacts with the Flexibility Information System

    A party is the thing that is authorized to access or modify data in the Flexiblity Information System.

    Example party types:

    * Service Provider
    * System Operator
    * End User

        Attributes:
            business_id_type (PartyBusinessIdType | Unset): The type of the business identifier. Example: gln.
            name (str | Unset): Name of the party. Maximum 128 characters. Example: Flex Energy Supplier.
            status (PartyStatus | Unset): The status of the party. Example: active.
            business_id (str | Unset): The business identifier of the party. Format depends on `business_id_type`. Example:
                1337099000000.
            entity_id (int | Unset): Reference to the entity that is the parent of the party. Example: 30.
            role (str | Unset): The role of the party. Currently maps to 1:1 to `type`. E.g. system_operator,
                service_provider. Example: flex_energy_supplier.
            type_ (str | Unset): The type of the party, e.g SystemOperator, ServiceProvider Example: energy_supplier.
            recorded_at (str | Unset): When the resource was recorded (created or updated) in the system. Example:
                2023-12-31 23:59:00 CET.
            recorded_by (int | Unset): The identity that recorded the resource. Example: 145.
            id (int | Unset): Unique surrogate identifier. Example: 11.
    """

    business_id_type: PartyBusinessIdType | Unset = UNSET
    name: str | Unset = UNSET
    status: PartyStatus | Unset = UNSET
    business_id: str | Unset = UNSET
    entity_id: int | Unset = UNSET
    role: str | Unset = UNSET
    type_: str | Unset = UNSET
    recorded_at: str | Unset = UNSET
    recorded_by: int | Unset = UNSET
    id: int | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        business_id_type: str | Unset = UNSET
        if not isinstance(self.business_id_type, Unset):
            business_id_type = self.business_id_type.value

        name = self.name

        status: str | Unset = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        business_id = self.business_id

        entity_id = self.entity_id

        role = self.role

        type_ = self.type_

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        id = self.id

        field_dict: dict[str, Any] = {}
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
        if type_ is not UNSET:
            field_dict["type"] = type_
        if recorded_at is not UNSET:
            field_dict["recorded_at"] = recorded_at
        if recorded_by is not UNSET:
            field_dict["recorded_by"] = recorded_by
        if id is not UNSET:
            field_dict["id"] = id

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        _business_id_type = d.pop("business_id_type", UNSET)
        business_id_type: PartyBusinessIdType | Unset
        if isinstance(_business_id_type, Unset):
            business_id_type = UNSET
        else:
            business_id_type = PartyBusinessIdType(_business_id_type)

        name = d.pop("name", UNSET)

        _status = d.pop("status", UNSET)
        status: PartyStatus | Unset
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = PartyStatus(_status)

        business_id = d.pop("business_id", UNSET)

        entity_id = d.pop("entity_id", UNSET)

        role = d.pop("role", UNSET)

        type_ = d.pop("type", UNSET)

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        id = d.pop("id", UNSET)

        party = cls(
            business_id_type=business_id_type,
            name=name,
            status=status,
            business_id=business_id,
            entity_id=entity_id,
            role=role,
            type_=type_,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            id=id,
        )

        party.additional_properties = d
        return party

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
