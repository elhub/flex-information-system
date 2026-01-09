from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="AccountingPointEndUserResponse")


@_attrs_define
class AccountingPointEndUserResponse:
    """Response schema for operations with return values - Relation telling which end user an accounting point belongs to.

    Attributes:
        accounting_point_id (int | Unset): The ID of the accounting point. Example: 245.
        end_user_id (int | Unset): The end user on the accounting point. Example: 12.
        valid_from (str | Unset): The date from which the accounting point belongs to the end user. Midnight aligned on
            Norwegian timezone. Example: 2022-08-08 00:00:00 CET.
        valid_to (None | str | Unset): The date until which the accounting point belongs to the end user. Midnight
            aligned on Norwegian timezone.
    """

    accounting_point_id: int | Unset = UNSET
    end_user_id: int | Unset = UNSET
    valid_from: str | Unset = UNSET
    valid_to: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        accounting_point_id = self.accounting_point_id

        end_user_id = self.end_user_id

        valid_from = self.valid_from

        valid_to: None | str | Unset
        if isinstance(self.valid_to, Unset):
            valid_to = UNSET
        else:
            valid_to = self.valid_to

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if accounting_point_id is not UNSET:
            field_dict["accounting_point_id"] = accounting_point_id
        if end_user_id is not UNSET:
            field_dict["end_user_id"] = end_user_id
        if valid_from is not UNSET:
            field_dict["valid_from"] = valid_from
        if valid_to is not UNSET:
            field_dict["valid_to"] = valid_to

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        accounting_point_id = d.pop("accounting_point_id", UNSET)

        end_user_id = d.pop("end_user_id", UNSET)

        valid_from = d.pop("valid_from", UNSET)

        def _parse_valid_to(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        valid_to = _parse_valid_to(d.pop("valid_to", UNSET))

        accounting_point_end_user_response = cls(
            accounting_point_id=accounting_point_id,
            end_user_id=end_user_id,
            valid_from=valid_from,
            valid_to=valid_to,
        )

        accounting_point_end_user_response.additional_properties = d
        return accounting_point_end_user_response

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
