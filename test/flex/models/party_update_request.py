from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.party_business_id_type import PartyBusinessIdType
from ..models.party_status import PartyStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="PartyUpdateRequest")


@_attrs_define
class PartyUpdateRequest:
    """Request schema for update operations - The body that interacts with the Flexibility Information System

    A party is the thing that is authorized to access or modify data in the Flexiblity Information System.

    Example party types:

    * Service Provider
    * System Operator
    * End User

        Attributes:
            business_id_type (PartyBusinessIdType | Unset): The type of the business identifier. Example: gln.
            name (str | Unset): Name of the party. Maximum 128 characters. Example: Flex Energy Supplier.
            status (PartyStatus | Unset): The status of the party. Example: active.
    """

    business_id_type: PartyBusinessIdType | Unset = UNSET
    name: str | Unset = UNSET
    status: PartyStatus | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        business_id_type: str | Unset = UNSET
        if not isinstance(self.business_id_type, Unset):
            business_id_type = self.business_id_type.value

        name = self.name

        status: str | Unset = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if business_id_type is not UNSET:
            field_dict["business_id_type"] = business_id_type
        if name is not UNSET:
            field_dict["name"] = name
        if status is not UNSET:
            field_dict["status"] = status

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

        party_update_request = cls(
            business_id_type=business_id_type,
            name=name,
            status=status,
        )

        party_update_request.additional_properties = d
        return party_update_request

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
