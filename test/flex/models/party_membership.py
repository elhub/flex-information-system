from typing import Any, Dict, List, Type, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="PartyMembership")


@_attrs_define
class PartyMembership:
    """Data schema - The relation between a party and entity.

    Attributes:
        recorded_at (str): When the resource was recorded (created or updated) in the system. Example: 2023-12-31
            23:59:00 CET.
        recorded_by (int): The identity that recorded the resource. Example: 145.
        party_id (Union[Unset, int]): Reference to the party that the membership links to an entity. Example: 379.
        entity_id (Union[Unset, int]): Reference to the entity that the party represents. Example: 30.
        id (Union[Unset, int]): Unique surrogate identifier. Example: 44.
    """

    recorded_at: str
    recorded_by: int
    party_id: Union[Unset, int] = UNSET
    entity_id: Union[Unset, int] = UNSET
    id: Union[Unset, int] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        party_id = self.party_id

        entity_id = self.entity_id

        id = self.id

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
            }
        )
        if party_id is not UNSET:
            field_dict["party_id"] = party_id
        if entity_id is not UNSET:
            field_dict["entity_id"] = entity_id
        if id is not UNSET:
            field_dict["id"] = id

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        recorded_at = d.pop("recorded_at")

        recorded_by = d.pop("recorded_by")

        party_id = d.pop("party_id", UNSET)

        entity_id = d.pop("entity_id", UNSET)

        id = d.pop("id", UNSET)

        party_membership = cls(
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            party_id=party_id,
            entity_id=entity_id,
            id=id,
        )

        party_membership.additional_properties = d
        return party_membership

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
