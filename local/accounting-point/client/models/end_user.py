from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..models.end_user_entity_type import EndUserEntityType
from ..types import UNSET, Unset

T = TypeVar("T", bound="EndUser")


@_attrs_define
class EndUser:
    """
    Attributes:
        business_id (str): Business ID of the end user. Norwegian organization number or fødselsnummer, depending on
            `business_id_type``.
             Example: 123456789.
        valid_from (datetime.datetime): Start of the validity period Example: 2024-01-01T00:00:00+01:00.
        entity_type (EndUserEntityType | Unset): Type of the end user entity, either a person or an organisation.
            Example: organisation.
        valid_to (datetime.datetime | None | Unset): End of the validity period Example: 2024-12-31T00:00:00+01:00.
    """

    business_id: str
    valid_from: datetime.datetime
    entity_type: EndUserEntityType | Unset = UNSET
    valid_to: datetime.datetime | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        business_id = self.business_id

        valid_from = self.valid_from.isoformat()

        entity_type: str | Unset = UNSET
        if not isinstance(self.entity_type, Unset):
            entity_type = self.entity_type.value

        valid_to: None | str | Unset
        if isinstance(self.valid_to, Unset):
            valid_to = UNSET
        elif isinstance(self.valid_to, datetime.datetime):
            valid_to = self.valid_to.isoformat()
        else:
            valid_to = self.valid_to

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "business_id": business_id,
                "valid_from": valid_from,
            }
        )
        if entity_type is not UNSET:
            field_dict["entity_type"] = entity_type
        if valid_to is not UNSET:
            field_dict["valid_to"] = valid_to

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        business_id = d.pop("business_id")

        valid_from = isoparse(d.pop("valid_from"))

        _entity_type = d.pop("entity_type", UNSET)
        entity_type: EndUserEntityType | Unset
        if isinstance(_entity_type, Unset):
            entity_type = UNSET
        else:
            entity_type = EndUserEntityType(_entity_type)

        def _parse_valid_to(data: object) -> datetime.datetime | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                valid_to_type_0 = isoparse(data)

                return valid_to_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.datetime | None | Unset, data)

        valid_to = _parse_valid_to(d.pop("valid_to", UNSET))

        end_user = cls(
            business_id=business_id,
            valid_from=valid_from,
            entity_type=entity_type,
            valid_to=valid_to,
        )

        end_user.additional_properties = d
        return end_user

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
