from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.party_business_id_type import PartyBusinessIdType
from ..models.party_role import PartyRole
from ..models.party_status import PartyStatus
from ..models.party_type import PartyType

T = TypeVar("T", bound="PartyResponse")


@_attrs_define
class PartyResponse:
    """Response schema - The body that interacts with the Flexibility Information System

    A party is the thing that is authorized to access or modify data in the Flexiblity Information System.

    Example party types:

    * Service Provider
    * System Operator
    * End User

        Attributes:
            id (int): Unique surrogate identifier. Example: 11.
            business_id (str): The business identifier of the party. Format depends on `business_id_type`. Example:
                1337099000000.
            business_id_type (PartyBusinessIdType): The type of the business identifier. Example: gln.
            entity_id (int): Reference to the entity that is the parent of the party. Example: 30.
            name (str): Name of the party. Maximum 128 characters. Example: Flex Energy Supplier.
            role (PartyRole): The role of the party. Currently maps to 1:1 to `type`. E.g. system_operator,
                service_provider. Example: flex_energy_supplier.
            type_ (PartyType): The type of the party, e.g SystemOperator, ServiceProvider Example: energy_supplier.
            status (PartyStatus): The status of the party. Example: active.
            recorded_at (str): When the resource was recorded (created or updated) in the system. Example: 2023-12-31
                23:59:00 CET.
            recorded_by (int): The identity that recorded the resource. Example: 145.
    """

    id: int
    business_id: str
    business_id_type: PartyBusinessIdType
    entity_id: int
    name: str
    role: PartyRole
    type_: PartyType
    status: PartyStatus
    recorded_at: str
    recorded_by: int
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        business_id = self.business_id

        business_id_type = self.business_id_type.value

        entity_id = self.entity_id

        name = self.name

        role = self.role.value

        type_ = self.type_.value

        status = self.status.value

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "business_id": business_id,
                "business_id_type": business_id_type,
                "entity_id": entity_id,
                "name": name,
                "role": role,
                "type": type_,
                "status": status,
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

        business_id_type = PartyBusinessIdType(d.pop("business_id_type"))

        entity_id = d.pop("entity_id")

        name = d.pop("name")

        role = PartyRole(d.pop("role"))

        type_ = PartyType(d.pop("type"))

        status = PartyStatus(d.pop("status"))

        recorded_at = d.pop("recorded_at")

        recorded_by = d.pop("recorded_by")

        party_response = cls(
            id=id,
            business_id=business_id,
            business_id_type=business_id_type,
            entity_id=entity_id,
            name=name,
            role=role,
            type_=type_,
            status=status,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
        )

        party_response.additional_properties = d
        return party_response

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
