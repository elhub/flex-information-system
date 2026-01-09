from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..models.controllable_unit_grid_validation_status import ControllableUnitGridValidationStatus
from ..models.controllable_unit_regulation_direction import ControllableUnitRegulationDirection
from ..models.controllable_unit_status import ControllableUnitStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="ControllableUnitHistory")


@_attrs_define
class ControllableUnitHistory:
    """Controllable unit - history

    Attributes:
        id (int): Unique surrogate key. Example: 12.
        business_id (str): Unique business identifier for the controllable unit. Example:
            53919b79-876f-4dad-8bde-b29368367604.
        name (str): Free text name of the controllable unit. Example: Car Charger #34.
        status (ControllableUnitStatus): The status of the controllable unit. Example: active.
        regulation_direction (ControllableUnitRegulationDirection): The regulation direction of the controllable unit.
            `up` means it can be used to increase production or decrease consumption, while `down` means to decrease
            production or increase consumption. Example: up.
        maximum_available_capacity (float): Maximum continuous active power that the controllable unit can produce or
            consume, i.e. deliver for balancing and congestion services, in kilowatts. Example: 3.5.
        is_small (bool): Whether the controllable unit is small or not, following NCDR. Example: True.
        accounting_point_id (int): Reference to the accounting point that the controllable unit is connected to.
            Example: 10289.
        grid_validation_status (ControllableUnitGridValidationStatus): The grid validation status of the controllable
            unit. Example: validated.
        recorded_at (str): When the resource was recorded (created or updated) in the system. Example: 2023-12-31
            23:59:00 CET.
        recorded_by (int): The identity that recorded the resource. Example: 145.
        controllable_unit_id (int): Reference to the resource that was updated. Example: 48.
        start_date (datetime.date | None | Unset): The usage date when the controllable unit is first active. Example:
            2024-05-17.
        minimum_duration (int | None | Unset): The minimum activation duration in seconds. Example: 30.
        maximum_duration (int | None | Unset): The maximum activation duration in seconds. Example: 1200.
        recovery_duration (int | None | Unset): The minimum recovery duration between activations in seconds. Example:
            3600.
        ramp_rate (float | None | Unset): The rate of power per unit of time to reach empty or full power for the
            controllable unit, in kilowatts per minute. Example: 0.1.
        grid_node_id (None | str | Unset): Reference to the node that the controllable unit is connected to. Example:
            53919b79-876f-4dad-8bde-b29368367604.
        grid_validation_notes (None | str | Unset): Free text notes on the current grid validation status.
        validated_at (None | str | Unset): When the controllable unit was last validated. Example: 2022-08-08 12:00:00
            CET.
        replaced_by (int | None | Unset): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (None | str | Unset): When the resource was replaced in the system. Example: 2024-07-07 10:00:00
            CET.
    """

    id: int
    business_id: str
    name: str
    status: ControllableUnitStatus
    regulation_direction: ControllableUnitRegulationDirection
    maximum_available_capacity: float
    is_small: bool
    accounting_point_id: int
    grid_validation_status: ControllableUnitGridValidationStatus
    recorded_at: str
    recorded_by: int
    controllable_unit_id: int
    start_date: datetime.date | None | Unset = UNSET
    minimum_duration: int | None | Unset = UNSET
    maximum_duration: int | None | Unset = UNSET
    recovery_duration: int | None | Unset = UNSET
    ramp_rate: float | None | Unset = UNSET
    grid_node_id: None | str | Unset = UNSET
    grid_validation_notes: None | str | Unset = UNSET
    validated_at: None | str | Unset = UNSET
    replaced_by: int | None | Unset = UNSET
    replaced_at: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        business_id = self.business_id

        name = self.name

        status = self.status.value

        regulation_direction = self.regulation_direction.value

        maximum_available_capacity = self.maximum_available_capacity

        is_small = self.is_small

        accounting_point_id = self.accounting_point_id

        grid_validation_status = self.grid_validation_status.value

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        controllable_unit_id = self.controllable_unit_id

        start_date: None | str | Unset
        if isinstance(self.start_date, Unset):
            start_date = UNSET
        elif isinstance(self.start_date, datetime.date):
            start_date = self.start_date.isoformat()
        else:
            start_date = self.start_date

        minimum_duration: int | None | Unset
        if isinstance(self.minimum_duration, Unset):
            minimum_duration = UNSET
        else:
            minimum_duration = self.minimum_duration

        maximum_duration: int | None | Unset
        if isinstance(self.maximum_duration, Unset):
            maximum_duration = UNSET
        else:
            maximum_duration = self.maximum_duration

        recovery_duration: int | None | Unset
        if isinstance(self.recovery_duration, Unset):
            recovery_duration = UNSET
        else:
            recovery_duration = self.recovery_duration

        ramp_rate: float | None | Unset
        if isinstance(self.ramp_rate, Unset):
            ramp_rate = UNSET
        else:
            ramp_rate = self.ramp_rate

        grid_node_id: None | str | Unset
        if isinstance(self.grid_node_id, Unset):
            grid_node_id = UNSET
        else:
            grid_node_id = self.grid_node_id

        grid_validation_notes: None | str | Unset
        if isinstance(self.grid_validation_notes, Unset):
            grid_validation_notes = UNSET
        else:
            grid_validation_notes = self.grid_validation_notes

        validated_at: None | str | Unset
        if isinstance(self.validated_at, Unset):
            validated_at = UNSET
        else:
            validated_at = self.validated_at

        replaced_by: int | None | Unset
        if isinstance(self.replaced_by, Unset):
            replaced_by = UNSET
        else:
            replaced_by = self.replaced_by

        replaced_at: None | str | Unset
        if isinstance(self.replaced_at, Unset):
            replaced_at = UNSET
        else:
            replaced_at = self.replaced_at

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "business_id": business_id,
                "name": name,
                "status": status,
                "regulation_direction": regulation_direction,
                "maximum_available_capacity": maximum_available_capacity,
                "is_small": is_small,
                "accounting_point_id": accounting_point_id,
                "grid_validation_status": grid_validation_status,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
                "controllable_unit_id": controllable_unit_id,
            }
        )
        if start_date is not UNSET:
            field_dict["start_date"] = start_date
        if minimum_duration is not UNSET:
            field_dict["minimum_duration"] = minimum_duration
        if maximum_duration is not UNSET:
            field_dict["maximum_duration"] = maximum_duration
        if recovery_duration is not UNSET:
            field_dict["recovery_duration"] = recovery_duration
        if ramp_rate is not UNSET:
            field_dict["ramp_rate"] = ramp_rate
        if grid_node_id is not UNSET:
            field_dict["grid_node_id"] = grid_node_id
        if grid_validation_notes is not UNSET:
            field_dict["grid_validation_notes"] = grid_validation_notes
        if validated_at is not UNSET:
            field_dict["validated_at"] = validated_at
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        business_id = d.pop("business_id")

        name = d.pop("name")

        status = ControllableUnitStatus(d.pop("status"))

        regulation_direction = ControllableUnitRegulationDirection(d.pop("regulation_direction"))

        maximum_available_capacity = d.pop("maximum_available_capacity")

        is_small = d.pop("is_small")

        accounting_point_id = d.pop("accounting_point_id")

        grid_validation_status = ControllableUnitGridValidationStatus(d.pop("grid_validation_status"))

        recorded_at = d.pop("recorded_at")

        recorded_by = d.pop("recorded_by")

        controllable_unit_id = d.pop("controllable_unit_id")

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

        def _parse_minimum_duration(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        minimum_duration = _parse_minimum_duration(d.pop("minimum_duration", UNSET))

        def _parse_maximum_duration(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        maximum_duration = _parse_maximum_duration(d.pop("maximum_duration", UNSET))

        def _parse_recovery_duration(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        recovery_duration = _parse_recovery_duration(d.pop("recovery_duration", UNSET))

        def _parse_ramp_rate(data: object) -> float | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(float | None | Unset, data)

        ramp_rate = _parse_ramp_rate(d.pop("ramp_rate", UNSET))

        def _parse_grid_node_id(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        grid_node_id = _parse_grid_node_id(d.pop("grid_node_id", UNSET))

        def _parse_grid_validation_notes(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        grid_validation_notes = _parse_grid_validation_notes(d.pop("grid_validation_notes", UNSET))

        def _parse_validated_at(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        validated_at = _parse_validated_at(d.pop("validated_at", UNSET))

        def _parse_replaced_by(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        replaced_by = _parse_replaced_by(d.pop("replaced_by", UNSET))

        def _parse_replaced_at(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        replaced_at = _parse_replaced_at(d.pop("replaced_at", UNSET))

        controllable_unit_history = cls(
            id=id,
            business_id=business_id,
            name=name,
            status=status,
            regulation_direction=regulation_direction,
            maximum_available_capacity=maximum_available_capacity,
            is_small=is_small,
            accounting_point_id=accounting_point_id,
            grid_validation_status=grid_validation_status,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            controllable_unit_id=controllable_unit_id,
            start_date=start_date,
            minimum_duration=minimum_duration,
            maximum_duration=maximum_duration,
            recovery_duration=recovery_duration,
            ramp_rate=ramp_rate,
            grid_node_id=grid_node_id,
            grid_validation_notes=grid_validation_notes,
            validated_at=validated_at,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
        )

        controllable_unit_history.additional_properties = d
        return controllable_unit_history

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
