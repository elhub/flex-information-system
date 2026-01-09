from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.accounting_point_bidding_zone_bidding_zone import AccountingPointBiddingZoneBiddingZone
from ..types import UNSET, Unset

T = TypeVar("T", bound="AccountingPointBiddingZoneUpdateRequest")


@_attrs_define
class AccountingPointBiddingZoneUpdateRequest:
    """Request schema for update operations - Relation telling which bidding zone an accounting point belongs to.

    Attributes:
        bidding_zone (AccountingPointBiddingZoneBiddingZone | Unset): The bidding zone of the accounting point. Example:
            NO3.
    """

    bidding_zone: AccountingPointBiddingZoneBiddingZone | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        bidding_zone: str | Unset = UNSET
        if not isinstance(self.bidding_zone, Unset):
            bidding_zone = self.bidding_zone.value

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if bidding_zone is not UNSET:
            field_dict["bidding_zone"] = bidding_zone

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

        accounting_point_bidding_zone_update_request = cls(
            bidding_zone=bidding_zone,
        )

        accounting_point_bidding_zone_update_request.additional_properties = d
        return accounting_point_bidding_zone_update_request

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
