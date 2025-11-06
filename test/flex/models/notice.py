from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.notice_data_party_missing import NoticeDataPartyMissing
    from ..models.notice_data_party_outdated import NoticeDataPartyOutdated
    from ..models.notice_data_product_type_not_qualified import NoticeDataProductTypeNotQualified
    from ..models.notice_data_valid_time_outside_contract import NoticeDataValidTimeOutsideContract


T = TypeVar("T", bound="Notice")


@_attrs_define
class Notice:
    """Data schema - Notice to users about various issues or actions expected from them.

    Attributes:
        party_id (int | Unset): Reference to the party targeted by the notice. Example: 18.
        type_ (str | Unset): The type of the notice. Example:
            no.elhub.flex.service_providing_group_membership.valid_time.outside_contract.
        source (str | Unset): The URI of the resource concerned by the event. Example:
            /service_providing_group_membership/4.
        data (NoticeDataPartyMissing | NoticeDataPartyOutdated | NoticeDataProductTypeNotQualified |
            NoticeDataValidTimeOutsideContract | Unset):
    """

    party_id: int | Unset = UNSET
    type_: str | Unset = UNSET
    source: str | Unset = UNSET
    data: (
        NoticeDataPartyMissing
        | NoticeDataPartyOutdated
        | NoticeDataProductTypeNotQualified
        | NoticeDataValidTimeOutsideContract
        | Unset
    ) = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.notice_data_party_missing import NoticeDataPartyMissing
        from ..models.notice_data_party_outdated import NoticeDataPartyOutdated
        from ..models.notice_data_valid_time_outside_contract import NoticeDataValidTimeOutsideContract

        party_id = self.party_id

        type_ = self.type_

        source = self.source

        data: dict[str, Any] | Unset
        if isinstance(self.data, Unset):
            data = UNSET
        elif isinstance(self.data, NoticeDataValidTimeOutsideContract):
            data = self.data.to_dict()
        elif isinstance(self.data, NoticeDataPartyMissing):
            data = self.data.to_dict()
        elif isinstance(self.data, NoticeDataPartyOutdated):
            data = self.data.to_dict()
        else:
            data = self.data.to_dict()

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if party_id is not UNSET:
            field_dict["party_id"] = party_id
        if type_ is not UNSET:
            field_dict["type"] = type_
        if source is not UNSET:
            field_dict["source"] = source
        if data is not UNSET:
            field_dict["data"] = data

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.notice_data_party_missing import NoticeDataPartyMissing
        from ..models.notice_data_party_outdated import NoticeDataPartyOutdated
        from ..models.notice_data_product_type_not_qualified import NoticeDataProductTypeNotQualified
        from ..models.notice_data_valid_time_outside_contract import NoticeDataValidTimeOutsideContract

        d = dict(src_dict)
        party_id = d.pop("party_id", UNSET)

        type_ = d.pop("type", UNSET)

        source = d.pop("source", UNSET)

        def _parse_data(
            data: object,
        ) -> (
            NoticeDataPartyMissing
            | NoticeDataPartyOutdated
            | NoticeDataProductTypeNotQualified
            | NoticeDataValidTimeOutsideContract
            | Unset
        ):
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                componentsschemasnotice_data_type_0 = NoticeDataValidTimeOutsideContract.from_dict(data)

                return componentsschemasnotice_data_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                componentsschemasnotice_data_type_1 = NoticeDataPartyMissing.from_dict(data)

                return componentsschemasnotice_data_type_1
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                componentsschemasnotice_data_type_2 = NoticeDataPartyOutdated.from_dict(data)

                return componentsschemasnotice_data_type_2
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            if not isinstance(data, dict):
                raise TypeError()
            componentsschemasnotice_data_type_3 = NoticeDataProductTypeNotQualified.from_dict(data)

            return componentsschemasnotice_data_type_3

        data = _parse_data(d.pop("data", UNSET))

        notice = cls(
            party_id=party_id,
            type_=type_,
            source=source,
            data=data,
        )

        notice.additional_properties = d
        return notice

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
