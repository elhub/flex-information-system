from collections.abc import Mapping
from typing import Any, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="IdentityResponse")


@_attrs_define
class IdentityResponse:
    """Response schema for operations with return values - Resource uniquely identifying a user by linking its entity and
    the potentially assumed party.

        Attributes:
            id (Union[Unset, int]): Unique surrogate identifier. Example: 44.
            entity_id (Union[Unset, int]): Reference to the entity using the identity. Example: 3.
            entity_name (Union[Unset, str]): Name of the entity using the identity. Example: Martin Andersen.
            party_id (Union[None, Unset, int]): Reference to the party assumed by the entity. Example: 17.
            party_name (Union[None, Unset, str]): Name of the party assumed by the entity. Example: Andersen SO.
    """

    id: Union[Unset, int] = UNSET
    entity_id: Union[Unset, int] = UNSET
    entity_name: Union[Unset, str] = UNSET
    party_id: Union[None, Unset, int] = UNSET
    party_name: Union[None, Unset, str] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        entity_id = self.entity_id

        entity_name = self.entity_name

        party_id: Union[None, Unset, int]
        if isinstance(self.party_id, Unset):
            party_id = UNSET
        else:
            party_id = self.party_id

        party_name: Union[None, Unset, str]
        if isinstance(self.party_name, Unset):
            party_name = UNSET
        else:
            party_name = self.party_name

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if id is not UNSET:
            field_dict["id"] = id
        if entity_id is not UNSET:
            field_dict["entity_id"] = entity_id
        if entity_name is not UNSET:
            field_dict["entity_name"] = entity_name
        if party_id is not UNSET:
            field_dict["party_id"] = party_id
        if party_name is not UNSET:
            field_dict["party_name"] = party_name

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id", UNSET)

        entity_id = d.pop("entity_id", UNSET)

        entity_name = d.pop("entity_name", UNSET)

        def _parse_party_id(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        party_id = _parse_party_id(d.pop("party_id", UNSET))

        def _parse_party_name(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        party_name = _parse_party_name(d.pop("party_name", UNSET))

        identity_response = cls(
            id=id,
            entity_id=entity_id,
            entity_name=entity_name,
            party_id=party_id,
            party_name=party_name,
        )

        identity_response.additional_properties = d
        return identity_response

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
