from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.accounting_point_response import AccountingPointResponse
    from ..models.metering_grid_area_response import MeteringGridAreaResponse


T = TypeVar("T", bound="AccountingPointMeteringGridAreaResponse")


@_attrs_define
class AccountingPointMeteringGridAreaResponse:
    """Response schema - Relation telling which metering grid area an accounting point belongs to.

    Attributes:
        accounting_point_id (int): The ID of the accounting point. Example: 45.
        metering_grid_area_id (int): The metering grid area of the accounting point. Example: 3.
        valid_from (datetime.datetime): The date from which the accounting point belongs to the metering grid area.
            Midnight aligned on Norwegian timezone. Example: 2023-09-09T00:00:00+02.
        valid_to (datetime.datetime | None | Unset): The date until which the accounting point belongs to the metering
            grid area. Midnight aligned on Norwegian timezone.
        accounting_point (AccountingPointResponse | None | Unset): Embedded accounting_point
        metering_grid_area (MeteringGridAreaResponse | None | Unset): Embedded metering_grid_area
    """

    accounting_point_id: int
    metering_grid_area_id: int
    valid_from: datetime.datetime
    valid_to: datetime.datetime | None | Unset = UNSET
    accounting_point: AccountingPointResponse | None | Unset = UNSET
    metering_grid_area: MeteringGridAreaResponse | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.accounting_point_response import AccountingPointResponse
        from ..models.metering_grid_area_response import MeteringGridAreaResponse

        accounting_point_id = self.accounting_point_id

        metering_grid_area_id = self.metering_grid_area_id

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

        metering_grid_area: dict[str, Any] | None | Unset
        if isinstance(self.metering_grid_area, Unset):
            metering_grid_area = UNSET
        elif isinstance(self.metering_grid_area, MeteringGridAreaResponse):
            metering_grid_area = self.metering_grid_area.to_dict()
        else:
            metering_grid_area = self.metering_grid_area

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "accounting_point_id": accounting_point_id,
                "metering_grid_area_id": metering_grid_area_id,
                "valid_from": valid_from,
            }
        )
        if valid_to is not UNSET:
            field_dict["valid_to"] = valid_to
        if accounting_point is not UNSET:
            field_dict["accounting_point"] = accounting_point
        if metering_grid_area is not UNSET:
            field_dict["metering_grid_area"] = metering_grid_area

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.accounting_point_response import AccountingPointResponse
        from ..models.metering_grid_area_response import MeteringGridAreaResponse

        d = dict(src_dict)
        accounting_point_id = d.pop("accounting_point_id")

        metering_grid_area_id = d.pop("metering_grid_area_id")

        valid_from = isoparse(d.pop("valid_from"))

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

        def _parse_metering_grid_area(data: object) -> MeteringGridAreaResponse | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                metering_grid_area_type_0 = MeteringGridAreaResponse.from_dict(data)

                return metering_grid_area_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(MeteringGridAreaResponse | None | Unset, data)

        metering_grid_area = _parse_metering_grid_area(d.pop("metering_grid_area", UNSET))

        accounting_point_metering_grid_area_response = cls(
            accounting_point_id=accounting_point_id,
            metering_grid_area_id=metering_grid_area_id,
            valid_from=valid_from,
            valid_to=valid_to,
            accounting_point=accounting_point,
            metering_grid_area=metering_grid_area,
        )

        accounting_point_metering_grid_area_response.additional_properties = d
        return accounting_point_metering_grid_area_response

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
