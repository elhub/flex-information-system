from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="PartyMembershipCreateRequest")


@_attrs_define
class PartyMembershipCreateRequest:
    """Request schema for create operations - The relation between a party and entity.

    Attributes:
        scopes (Union[Unset, List[str]]): List of scopes granted to the entity when it acts as the party. Scopes are
            inspired from OAuth 2.0 and allow refinement of access control and privilege delegation mechanisms. Example:
            ['resources'].
        party_id (Union[Unset, int]): Reference to the party that the membership links to an entity. Example: 379.
        entity_id (Union[Unset, int]): Reference to the entity that the party represents. Example: 30.
    """

    scopes: Union[Unset, List[str]] = UNSET
    party_id: Union[Unset, int] = UNSET
    entity_id: Union[Unset, int] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        scopes: Union[Unset, List[str]] = UNSET
        if not isinstance(self.scopes, Unset):
            scopes = self.scopes

        party_id = self.party_id

        entity_id = self.entity_id

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if scopes is not UNSET:
            field_dict["scopes"] = scopes
        if party_id is not UNSET:
            field_dict["party_id"] = party_id
        if entity_id is not UNSET:
            field_dict["entity_id"] = entity_id

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        scopes = cast(List[str], d.pop("scopes", UNSET))

        party_id = d.pop("party_id", UNSET)

        entity_id = d.pop("entity_id", UNSET)

        party_membership_create_request = cls(
            scopes=scopes,
            party_id=party_id,
            entity_id=entity_id,
        )

        party_membership_create_request.additional_properties = d
        return party_membership_create_request

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
