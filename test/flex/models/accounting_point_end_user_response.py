from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.accounting_point_response import AccountingPointResponse
    from ..models.party_response import PartyResponse


T = TypeVar("T", bound="AccountingPointEndUserResponse")


@_attrs_define
class AccountingPointEndUserResponse:
    """Response schema - Relation telling which end user an accounting point belongs to.

    Attributes:
        accounting_point_id (int): The ID of the accounting point. Example: 245.
        end_user_id (int): The end user on the accounting point. Example: 12.
        valid_from (datetime.datetime): The date from which the accounting point belongs to the end user. Midnight
            aligned on Norwegian timezone. Example: 2022-08-08T00:00:00+02.
        valid_to (datetime.datetime | None | Unset): The date until which the accounting point belongs to the end user.
            Midnight aligned on Norwegian timezone.
        accounting_point (AccountingPointResponse | None | Unset): Embedded accounting_point
        end_user (None | PartyResponse | Unset): Embedded party
    """

    accounting_point_id: int
    end_user_id: int
    valid_from: datetime.datetime
    valid_to: datetime.datetime | None | Unset = UNSET
    accounting_point: AccountingPointResponse | None | Unset = UNSET
    end_user: None | PartyResponse | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.accounting_point_response import AccountingPointResponse
        from ..models.party_response import PartyResponse

        accounting_point_id = self.accounting_point_id

        end_user_id = self.end_user_id

        valid_from = self.valid_from.isoformat()

        valid_to: None | str | Unset
        if isinstance(self.valid_to, Unset):
            valid_to = UNSET
        elif isinstance(self.valid_to, datetime.datetime):
            valid_to = self.valid_to.isoformat()
        else:
            valid_to = self.valid_to

        accounting_point: dict[str, Any] | None | Unset
        if isinstance(self.accounting_point, Unset):
            accounting_point = UNSET
        elif isinstance(self.accounting_point, AccountingPointResponse):
            accounting_point = self.accounting_point.to_dict()
        else:
            accounting_point = self.accounting_point

        end_user: dict[str, Any] | None | Unset
        if isinstance(self.end_user, Unset):
            end_user = UNSET
        elif isinstance(self.end_user, PartyResponse):
            end_user = self.end_user.to_dict()
        else:
            end_user = self.end_user

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "accounting_point_id": accounting_point_id,
                "end_user_id": end_user_id,
                "valid_from": valid_from,
            }
        )
        if valid_to is not UNSET:
            field_dict["valid_to"] = valid_to
        if accounting_point is not UNSET:
            field_dict["accounting_point"] = accounting_point
        if end_user is not UNSET:
            field_dict["end_user"] = end_user

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.accounting_point_response import AccountingPointResponse
        from ..models.party_response import PartyResponse

        d = dict(src_dict)
        accounting_point_id = d.pop("accounting_point_id")

        end_user_id = d.pop("end_user_id")

        valid_from = datetime.datetime.fromisoformat(d.pop("valid_from"))

        def _parse_valid_to(data: object) -> datetime.datetime | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                valid_to_type_0 = datetime.datetime.fromisoformat(data)

                return valid_to_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.datetime | None | Unset, data)

        valid_to = _parse_valid_to(d.pop("valid_to", UNSET))

        def _parse_accounting_point(data: object) -> AccountingPointResponse | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                accounting_point_type_0 = AccountingPointResponse.from_dict(data)

                return accounting_point_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(AccountingPointResponse | None | Unset, data)

        accounting_point = _parse_accounting_point(d.pop("accounting_point", UNSET))

        def _parse_end_user(data: object) -> None | PartyResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                end_user_type_0 = PartyResponse.from_dict(data)

                return end_user_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | PartyResponse | Unset, data)

        end_user = _parse_end_user(d.pop("end_user", UNSET))

        accounting_point_end_user_response = cls(
            accounting_point_id=accounting_point_id,
            end_user_id=end_user_id,
            valid_from=valid_from,
            valid_to=valid_to,
            accounting_point=accounting_point,
            end_user=end_user,
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
