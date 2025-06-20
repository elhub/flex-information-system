from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.party_optional import PartyOptional


T = TypeVar("T", bound="NoticeDataPartyOutdated")


@_attrs_define
class NoticeDataPartyOutdated:
    """Format of the data field in a notice of type no.elhub.flex.party.outdated

    Attributes:
        party (Union[Unset, PartyOptional]): Schema with optional fields for embedding - The body that interacts with
            the Flexibility Information System

            A party is the thing that is authorized to access or modify data in the Flexiblity Information System.

            Example party types:

            * Service Provider
            * System Operator
            * End User
    """

    party: Union[Unset, "PartyOptional"] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        party: Union[Unset, Dict[str, Any]] = UNSET
        if not isinstance(self.party, Unset):
            party = self.party.to_dict()

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if party is not UNSET:
            field_dict["party"] = party

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.party_optional import PartyOptional

        d = src_dict.copy()
        _party = d.pop("party", UNSET)
        party: Union[Unset, PartyOptional]
        if isinstance(_party, Unset):
            party = UNSET
        else:
            party = PartyOptional.from_dict(_party)

        notice_data_party_outdated = cls(
            party=party,
        )

        notice_data_party_outdated.additional_properties = d
        return notice_data_party_outdated

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
