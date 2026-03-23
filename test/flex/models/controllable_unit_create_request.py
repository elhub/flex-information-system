from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..models.controllable_unit_regulation_direction import ControllableUnitRegulationDirection
from ..models.controllable_unit_status import ControllableUnitStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="ControllableUnitCreateRequest")


@_attrs_define
class ControllableUnitCreateRequest:
    """Request schema for create operations - Controllable unit

    Attributes:
        name (str): Free text name of the controllable unit. Example: Car Charger #34.
        regulation_direction (ControllableUnitRegulationDirection): The regulation direction of the controllable unit.
            `up` means it can be used to increase production or decrease consumption, while `down` means to decrease
            production or increase consumption. Example: up.
        maximum_active_power (float): Maximum continuous active power that the controllable unit can produce or consume,
            i.e. deliver for balancing and congestion services, in kilowatts. Example: 3.5.
        accounting_point_id (int): Reference to the accounting point that the controllable unit is connected to.
            Example: 10289.
        start_date (datetime.date | None | Unset): The usage date when the controllable unit is first active. Example:
            2024-05-17.
        status (ControllableUnitStatus | Unset): The status of the controllable unit. Example: active.
    """

    name: str
    regulation_direction: ControllableUnitRegulationDirection
    maximum_active_power: float
    accounting_point_id: int
    start_date: datetime.date | None | Unset = UNSET
    status: ControllableUnitStatus | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        name = self.name

        regulation_direction = self.regulation_direction.value

        maximum_active_power = self.maximum_active_power

        accounting_point_id = self.accounting_point_id

        start_date: None | str | Unset
        if isinstance(self.start_date, Unset):
            start_date = UNSET
        elif isinstance(self.start_date, datetime.date):
            start_date = self.start_date.isoformat()
        else:
            start_date = self.start_date

        status: str | Unset = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "name": name,
                "regulation_direction": regulation_direction,
                "maximum_active_power": maximum_active_power,
                "accounting_point_id": accounting_point_id,
            }
        )
        if start_date is not UNSET:
            field_dict["start_date"] = start_date
        if status is not UNSET:
            field_dict["status"] = status

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        name = d.pop("name")

        regulation_direction = ControllableUnitRegulationDirection(d.pop("regulation_direction"))

        maximum_active_power = d.pop("maximum_active_power")

        accounting_point_id = d.pop("accounting_point_id")

        def _parse_start_date(data: object) -> datetime.date | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                start_date_type_0 = isoparse(data).date()

                return start_date_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.date | None | Unset, data)

        start_date = _parse_start_date(d.pop("start_date", UNSET))

        _status = d.pop("status", UNSET)
        status: ControllableUnitStatus | Unset
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = ControllableUnitStatus(_status)

        controllable_unit_create_request = cls(
            name=name,
            regulation_direction=regulation_direction,
            maximum_active_power=maximum_active_power,
            accounting_point_id=accounting_point_id,
            start_date=start_date,
            status=status,
        )

        controllable_unit_create_request.additional_properties = d
        return controllable_unit_create_request

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
