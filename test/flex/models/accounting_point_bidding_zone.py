from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.accounting_point_bidding_zone_bidding_zone import AccountingPointBiddingZoneBiddingZone
from ..types import UNSET, Unset

T = TypeVar("T", bound="AccountingPointBiddingZone")


@_attrs_define
class AccountingPointBiddingZone:
    """Data schema - Relation telling which bidding zone an accounting point belongs to.

    Attributes:
        bidding_zone (AccountingPointBiddingZoneBiddingZone | Unset): The bidding zone of the accounting point. Example:
            NO3.
        accounting_point_id (int | Unset): The ID of the accounting point. Example: 245.
        valid_from (str | Unset): The date from which the accounting point belongs to the bidding zone. Midnight aligned
            on Norwegian timezone. Example: 2022-08-08 00:00:00 CET.
        valid_to (None | str | Unset): The date until which the accounting point belongs to the bidding zone. Midnight
            aligned on Norwegian timezone.
    """

    bidding_zone: AccountingPointBiddingZoneBiddingZone | Unset = UNSET
    accounting_point_id: int | Unset = UNSET
    valid_from: str | Unset = UNSET
    valid_to: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        bidding_zone: str | Unset = UNSET
        if not isinstance(self.bidding_zone, Unset):
            bidding_zone = self.bidding_zone.value

        accounting_point_id = self.accounting_point_id

        valid_from = self.valid_from

        valid_to: None | str | Unset
        if isinstance(self.valid_to, Unset):
            valid_to = UNSET
        else:
            valid_to = self.valid_to

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if bidding_zone is not UNSET:
            field_dict["bidding_zone"] = bidding_zone
        if accounting_point_id is not UNSET:
            field_dict["accounting_point_id"] = accounting_point_id
        if valid_from is not UNSET:
            field_dict["valid_from"] = valid_from
        if valid_to is not UNSET:
            field_dict["valid_to"] = valid_to

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        _bidding_zone = d.pop("bidding_zone", UNSET)
        bidding_zone: AccountingPointBiddingZoneBiddingZone | Unset
        if isinstance(_bidding_zone, Unset):
            bidding_zone = UNSET
        else:
            bidding_zone = AccountingPointBiddingZoneBiddingZone(_bidding_zone)

        accounting_point_id = d.pop("accounting_point_id", UNSET)

        valid_from = d.pop("valid_from", UNSET)

        def _parse_valid_to(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        valid_to = _parse_valid_to(d.pop("valid_to", UNSET))

        accounting_point_bidding_zone = cls(
            bidding_zone=bidding_zone,
            accounting_point_id=accounting_point_id,
            valid_from=valid_from,
            valid_to=valid_to,
        )

        accounting_point_bidding_zone.additional_properties = d
        return accounting_point_bidding_zone

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
