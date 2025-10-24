from collections.abc import Mapping
from typing import Any, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="EventResponse")


@_attrs_define
class EventResponse:
    """Response schema for operations with return values - Event happening in the system.

    Attributes:
        id (Union[Unset, int]): Unique surrogate identifier. Example: 89.
        specversion (Union[Unset, str]): The version of the CloudEvents specification followed by the resource. Example:
            1.0.
        time (Union[Unset, str]): The time at which the event was generated. Example: 2022-08-08 12:00:00 CET.
        type_ (Union[Unset, str]): The type of the event. Example: no.elhub.flex.service_providing_group.update.
        source (Union[Unset, str]): The URI of the resource concerned by the event. Example: /service_providing_group/4.
        data (Union[None, Unset, str]): The data of the event.
    """

    id: Union[Unset, int] = UNSET
    specversion: Union[Unset, str] = UNSET
    time: Union[Unset, str] = UNSET
    type_: Union[Unset, str] = UNSET
    source: Union[Unset, str] = UNSET
    data: Union[None, Unset, str] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        specversion = self.specversion

        time = self.time

        type_ = self.type_

        source = self.source

        data: Union[None, Unset, str]
        if isinstance(self.data, Unset):
            data = UNSET
        else:
            data = self.data

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if id is not UNSET:
            field_dict["id"] = id
        if specversion is not UNSET:
            field_dict["specversion"] = specversion
        if time is not UNSET:
            field_dict["time"] = time
        if type_ is not UNSET:
            field_dict["type"] = type_
        if source is not UNSET:
            field_dict["source"] = source
        if data is not UNSET:
            field_dict["data"] = data

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id", UNSET)

        specversion = d.pop("specversion", UNSET)

        time = d.pop("time", UNSET)

        type_ = d.pop("type", UNSET)

        source = d.pop("source", UNSET)

        def _parse_data(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        data = _parse_data(d.pop("data", UNSET))

        event_response = cls(
            id=id,
            specversion=specversion,
            time=time,
            type_=type_,
            source=source,
            data=data,
        )

        event_response.additional_properties = d
        return event_response

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
