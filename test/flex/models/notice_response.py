from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="NoticeResponse")


@_attrs_define
class NoticeResponse:
    """Response schema for operations with return values - Notice to users about various issues or actions expected from
    them.

        Attributes:
            party_id (Union[Unset, int]): Reference to the party targeted by the notice. Example: 18.
            type (Union[Unset, str]): The type of the notice. Example:
                no.elhub.flex.service_providing_group_membership.valid_time.outside_contract.
            source (Union[Unset, str]): The URI of the resource concerned by the event. Example:
                /service_providing_group_membership/4.
            data (Union[None, Unset, str]): The data of the notice.
    """

    party_id: Union[Unset, int] = UNSET
    type: Union[Unset, str] = UNSET
    source: Union[Unset, str] = UNSET
    data: Union[None, Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        party_id = self.party_id

        type = self.type

        source = self.source

        data: Union[None, Unset, str]
        if isinstance(self.data, Unset):
            data = UNSET
        else:
            data = self.data

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if party_id is not UNSET:
            field_dict["party_id"] = party_id
        if type is not UNSET:
            field_dict["type"] = type
        if source is not UNSET:
            field_dict["source"] = source
        if data is not UNSET:
            field_dict["data"] = data

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        party_id = d.pop("party_id", UNSET)

        type = d.pop("type", UNSET)

        source = d.pop("source", UNSET)

        def _parse_data(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        data = _parse_data(d.pop("data", UNSET))

        notice_response = cls(
            party_id=party_id,
            type=type,
            source=source,
            data=data,
        )

        notice_response.additional_properties = d
        return notice_response

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
