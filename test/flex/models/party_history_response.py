from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.party_business_id_type import PartyBusinessIdType
from ..models.party_role import PartyRole
from ..models.party_status import PartyStatus
from ..models.party_type import PartyType
from ..types import UNSET, Unset

T = TypeVar("T", bound="PartyHistoryResponse")


@_attrs_define
class PartyHistoryResponse:
    """Party - history

    Attributes:
        party_id (int): Reference to the resource that was updated. Example: 48.
        business_id_type (PartyBusinessIdType | Unset): The type of the business identifier. Example: gln.
        name (str | Unset): Name of the party. Maximum 128 characters. Example: Flex Energy Supplier.
        role (PartyRole | Unset): The role of the party. Currently maps to 1:1 to `type`. E.g. system_operator,
            service_provider. Example: flex_energy_supplier.
        type_ (PartyType | Unset): The type of the party, e.g SystemOperator, ServiceProvider Example: energy_supplier.
        status (PartyStatus | Unset): The status of the party. Example: active.
        business_id (str | Unset): The business identifier of the party. Format depends on `business_id_type`. Example:
            1337099000000.
        entity_id (int | Unset): Reference to the entity that is the parent of the party. Example: 30.
        recorded_at (str | Unset): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31 23:59:00 CET.
        recorded_by (int | Unset): The identity that recorded the resource. Example: 145.
        id (int | Unset): Unique surrogate identifier. Example: 11.
        replaced_by (int | None | Unset): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (None | str | Unset): When the resource was replaced in the system. Example: 2024-07-07 10:00:00
            CET.
    """

    party_id: int
    business_id_type: PartyBusinessIdType | Unset = UNSET
    name: str | Unset = UNSET
    role: PartyRole | Unset = UNSET
    type_: PartyType | Unset = UNSET
    status: PartyStatus | Unset = UNSET
    business_id: str | Unset = UNSET
    entity_id: int | Unset = UNSET
    recorded_at: str | Unset = UNSET
    recorded_by: int | Unset = UNSET
    id: int | Unset = UNSET
    replaced_by: int | None | Unset = UNSET
    replaced_at: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        party_id = self.party_id

        business_id_type: str | Unset = UNSET
        if not isinstance(self.business_id_type, Unset):
            business_id_type = self.business_id_type.value

        name = self.name

        role: str | Unset = UNSET
        if not isinstance(self.role, Unset):
            role = self.role.value

        type_: str | Unset = UNSET
        if not isinstance(self.type_, Unset):
            type_ = self.type_.value

        status: str | Unset = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        business_id = self.business_id

        entity_id = self.entity_id

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        id = self.id

        replaced_by: int | None | Unset
        if isinstance(self.replaced_by, Unset):
            replaced_by = UNSET
        else:
            replaced_by = self.replaced_by

        replaced_at: None | str | Unset
        if isinstance(self.replaced_at, Unset):
            replaced_at = UNSET
        else:
            replaced_at = self.replaced_at

        field_dict: dict[str, Any] = {}
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
        if role is not UNSET:
            field_dict["role"] = role
        if type_ is not UNSET:
            field_dict["type"] = type_
        if status is not UNSET:
            field_dict["status"] = status
        if business_id is not UNSET:
            field_dict["business_id"] = business_id
        if entity_id is not UNSET:
            field_dict["entity_id"] = entity_id
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
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        party_id = d.pop("party_id")

        _business_id_type = d.pop("business_id_type", UNSET)
        business_id_type: PartyBusinessIdType | Unset
        if isinstance(_business_id_type, Unset):
            business_id_type = UNSET
        else:
            business_id_type = PartyBusinessIdType(_business_id_type)

        name = d.pop("name", UNSET)

        _role = d.pop("role", UNSET)
        role: PartyRole | Unset
        if isinstance(_role, Unset):
            role = UNSET
        else:
            role = PartyRole(_role)

        _type_ = d.pop("type", UNSET)
        type_: PartyType | Unset
        if isinstance(_type_, Unset):
            type_ = UNSET
        else:
            type_ = PartyType(_type_)

        _status = d.pop("status", UNSET)
        status: PartyStatus | Unset
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = PartyStatus(_status)

        business_id = d.pop("business_id", UNSET)

        entity_id = d.pop("entity_id", UNSET)

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        id = d.pop("id", UNSET)

        def _parse_replaced_by(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        replaced_by = _parse_replaced_by(d.pop("replaced_by", UNSET))

        def _parse_replaced_at(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        replaced_at = _parse_replaced_at(d.pop("replaced_at", UNSET))

        party_history_response = cls(
            party_id=party_id,
            business_id_type=business_id_type,
            name=name,
            role=role,
            type_=type_,
            status=status,
            business_id=business_id,
            entity_id=entity_id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            id=id,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
        )

        party_history_response.additional_properties = d
        return party_history_response

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
