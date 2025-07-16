from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.party_membership_update_request_scopes_item import PartyMembershipUpdateRequestScopesItem
from ..types import UNSET, Unset

T = TypeVar("T", bound="PartyMembershipHistoryResponse")


@_attrs_define
class PartyMembershipHistoryResponse:
    """Party Membership - history

    Attributes:
        party_membership_id (int): Reference to the resource that was updated. Example: 48.
        scopes (Union[Unset, List[PartyMembershipUpdateRequestScopesItem]]): List of scopes granted to the entity when
            it acts as the party. Scopes are inspired from OAuth 2.0 and allow refinement of access control and privilege
            delegation mechanisms. Example: ['readonly'].
        party_id (Union[Unset, int]): Reference to the party that the membership links to an entity. Example: 379.
        entity_id (Union[Unset, int]): Reference to the entity that the party represents. Example: 30.
        recorded_at (Union[Unset, str]): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31 23:59:00 CET.
        recorded_by (Union[Unset, int]): The identity that recorded the resource. Example: 145.
        id (Union[Unset, int]): Unique surrogate identifier. Example: 44.
        replaced_by (Union[None, Unset, int]): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (Union[None, Unset, str]): When the resource was replaced in the system. Example: 2024-07-07
            10:00:00 CET.
    """

    party_membership_id: int
    scopes: Union[Unset, List[PartyMembershipUpdateRequestScopesItem]] = UNSET
    party_id: Union[Unset, int] = UNSET
    entity_id: Union[Unset, int] = UNSET
    recorded_at: Union[Unset, str] = UNSET
    recorded_by: Union[Unset, int] = UNSET
    id: Union[Unset, int] = UNSET
    replaced_by: Union[None, Unset, int] = UNSET
    replaced_at: Union[None, Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        party_membership_id = self.party_membership_id

        scopes: Union[Unset, List[str]] = UNSET
        if not isinstance(self.scopes, Unset):
            scopes = []
            for scopes_item_data in self.scopes:
                scopes_item = scopes_item_data.value
                scopes.append(scopes_item)

        party_id = self.party_id

        entity_id = self.entity_id

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
                "party_membership_id": party_membership_id,
            }
        )
        if scopes is not UNSET:
            field_dict["scopes"] = scopes
        if party_id is not UNSET:
            field_dict["party_id"] = party_id
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
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        party_membership_id = d.pop("party_membership_id")

        scopes = []
        _scopes = d.pop("scopes", UNSET)
        for scopes_item_data in _scopes or []:
            scopes_item = PartyMembershipUpdateRequestScopesItem(scopes_item_data)

            scopes.append(scopes_item)

        party_id = d.pop("party_id", UNSET)

        entity_id = d.pop("entity_id", UNSET)

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

        party_membership_history_response = cls(
            party_membership_id=party_membership_id,
            scopes=scopes,
            party_id=party_id,
            entity_id=entity_id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            id=id,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
        )

        party_membership_history_response.additional_properties = d
        return party_membership_history_response

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
