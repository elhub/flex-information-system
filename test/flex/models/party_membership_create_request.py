from typing import Any, Dict, List, Type, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

T = TypeVar("T", bound="PartyMembershipCreateRequest")


@_attrs_define
class PartyMembershipCreateRequest:
    """Request schema for create operations - The relation between a party and entity.

    Attributes:
        party_id (int): Reference to the party that the membership links to an entity. Example: 379.
        entity_id (int): Reference to the entity that the party represents. Example: 30.
    """

    party_id: int
    entity_id: int
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        party_id = self.party_id

        entity_id = self.entity_id

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "party_id": party_id,
                "entity_id": entity_id,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        party_id = d.pop("party_id")

        entity_id = d.pop("entity_id")

        party_membership_create_request = cls(
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
