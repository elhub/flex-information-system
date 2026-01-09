from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.entity_response import EntityResponse
    from ..models.party_response import PartyResponse


T = TypeVar("T", bound="NoticeDataPartyOutdated")


@_attrs_define
class NoticeDataPartyOutdated:
    """Format of the data field in a notice of type no.elhub.flex.party.outdated

    Attributes:
        entity (EntityResponse | Unset): Data schema - Entity - Natural or legal person

            An entity is a natural or legal person that can be a party in the Flexibility Information System.

            Example entity types:

            * Person
            * Organisation
        party (PartyResponse | Unset): Data schema - The body that interacts with the Flexibility Information System

            A party is the thing that is authorized to access or modify data in the Flexiblity Information System.

            Example party types:

            * Service Provider
            * System Operator
            * End User
    """

    entity: EntityResponse | Unset = UNSET
    party: PartyResponse | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        entity: dict[str, Any] | Unset = UNSET
        if not isinstance(self.entity, Unset):
            entity = self.entity.to_dict()

        party: dict[str, Any] | Unset = UNSET
        if not isinstance(self.party, Unset):
            party = self.party.to_dict()

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if entity is not UNSET:
            field_dict["entity"] = entity
        if party is not UNSET:
            field_dict["party"] = party

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.entity_response import EntityResponse
        from ..models.party_response import PartyResponse

        d = dict(src_dict)
        _entity = d.pop("entity", UNSET)
        entity: EntityResponse | Unset
        if isinstance(_entity, Unset):
            entity = UNSET
        else:
            entity = EntityResponse.from_dict(_entity)

        _party = d.pop("party", UNSET)
        party: PartyResponse | Unset
        if isinstance(_party, Unset):
            party = UNSET
        else:
            party = PartyResponse.from_dict(_party)

        notice_data_party_outdated = cls(
            entity=entity,
            party=party,
        )

        notice_data_party_outdated.additional_properties = d
        return notice_data_party_outdated

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
