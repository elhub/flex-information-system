from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.entity_response import EntityResponse
    from ..models.party_response import PartyResponse


T = TypeVar("T", bound="IdentityResponse")


@_attrs_define
class IdentityResponse:
    """Response schema - Resource uniquely identifying a user by linking its entity and the potentially assumed party.

    Attributes:
        id (int): Unique surrogate identifier. Example: 44.
        entity_id (int): Reference to the entity using the identity. Example: 3.
        entity_name (str): Name of the entity using the identity. Example: Martin Andersen.
        party_id (int | None | Unset): Reference to the party assumed by the entity. Example: 17.
        party_name (None | str | Unset): Name of the party assumed by the entity. Example: Andersen SO.
        entity (EntityResponse | None | Unset): Embedded entity
        party (None | PartyResponse | Unset): Embedded party
    """

    id: int
    entity_id: int
    entity_name: str
    party_id: int | None | Unset = UNSET
    party_name: None | str | Unset = UNSET
    entity: EntityResponse | None | Unset = UNSET
    party: None | PartyResponse | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.entity_response import EntityResponse
        from ..models.party_response import PartyResponse

        id = self.id

        entity_id = self.entity_id

        entity_name = self.entity_name

        party_id: int | None | Unset
        if isinstance(self.party_id, Unset):
            party_id = UNSET
        else:
            party_id = self.party_id

        party_name: None | str | Unset
        if isinstance(self.party_name, Unset):
            party_name = UNSET
        else:
            party_name = self.party_name

        entity: dict[str, Any] | None | Unset
        if isinstance(self.entity, Unset):
            entity = UNSET
        elif isinstance(self.entity, EntityResponse):
            entity = self.entity.to_dict()
        else:
            entity = self.entity

        party: dict[str, Any] | None | Unset
        if isinstance(self.party, Unset):
            party = UNSET
        elif isinstance(self.party, PartyResponse):
            party = self.party.to_dict()
        else:
            party = self.party

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "entity_id": entity_id,
                "entity_name": entity_name,
            }
        )
        if party_id is not UNSET:
            field_dict["party_id"] = party_id
        if party_name is not UNSET:
            field_dict["party_name"] = party_name
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
        id = d.pop("id")

        entity_id = d.pop("entity_id")

        entity_name = d.pop("entity_name")

        def _parse_party_id(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        party_id = _parse_party_id(d.pop("party_id", UNSET))

        def _parse_party_name(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        party_name = _parse_party_name(d.pop("party_name", UNSET))

        def _parse_entity(data: object) -> EntityResponse | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                entity_type_0 = EntityResponse.from_dict(data)

                return entity_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(EntityResponse | None | Unset, data)

        entity = _parse_entity(d.pop("entity", UNSET))

        def _parse_party(data: object) -> None | PartyResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                party_type_0 = PartyResponse.from_dict(data)

                return party_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | PartyResponse | Unset, data)

        party = _parse_party(d.pop("party", UNSET))

        identity_response = cls(
            id=id,
            entity_id=entity_id,
            entity_name=entity_name,
            party_id=party_id,
            party_name=party_name,
            entity=entity,
            party=party,
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
