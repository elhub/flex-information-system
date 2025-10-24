import datetime
from collections.abc import Mapping
from typing import Any, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..models.controllable_unit_grid_validation_status import ControllableUnitGridValidationStatus
from ..models.controllable_unit_regulation_direction import ControllableUnitRegulationDirection
from ..models.controllable_unit_status import ControllableUnitStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="ControllableUnitCreateRequest")


@_attrs_define
class ControllableUnitCreateRequest:
    """Request schema for create operations - Controllable unit

    Attributes:
        name (Union[Unset, str]): Free text name of the controllable unit. Example: Car Charger #34.
        start_date (Union[None, Unset, datetime.date]): The usage date when the controllable unit is first active.
            Example: 2024-05-17.
        status (Union[Unset, ControllableUnitStatus]): The status of the controllable unit. Example: active.
        regulation_direction (Union[Unset, ControllableUnitRegulationDirection]): The regulation direction of the
            controllable unit. `up` means it can be used to increase production or decrease consumption, while `down` means
            to decrease production or increase consumption. Example: up.
        maximum_available_capacity (Union[Unset, float]): Maximum continuous active power that the controllable unit can
            produce or consume, i.e. deliver for balancing and congestion services, in kilowatts. Example: 3.5.
        minimum_duration (Union[None, Unset, int]): The minimum activation duration in seconds. Example: 30.
        maximum_duration (Union[None, Unset, int]): The maximum activation duration in seconds. Example: 1200.
        recovery_duration (Union[None, Unset, int]): The minimum recovery duration between activations in seconds.
            Example: 3600.
        ramp_rate (Union[None, Unset, float]): The rate of power per unit of time to reach empty or full power for the
            controllable unit, in kilowatts per minute. Example: 0.1.
        grid_node_id (Union[None, Unset, str]): Reference to the node that the controllable unit is connected to.
            Example: 53919b79-876f-4dad-8bde-b29368367604.
        grid_validation_status (Union[Unset, ControllableUnitGridValidationStatus]): The grid validation status of the
            controllable unit. Example: validated.
        grid_validation_notes (Union[None, Unset, str]): Free text notes on the current grid validation status.
        validated_at (Union[None, Unset, str]): When the controllable unit was last validated. Example: 2022-08-08
            12:00:00 CET.
        accounting_point_id (Union[Unset, int]): Reference to the accounting point that the controllable unit is
            connected to. Example: 10289.
    """

    name: Union[Unset, str] = UNSET
    start_date: Union[None, Unset, datetime.date] = UNSET
    status: Union[Unset, ControllableUnitStatus] = UNSET
    regulation_direction: Union[Unset, ControllableUnitRegulationDirection] = UNSET
    maximum_available_capacity: Union[Unset, float] = UNSET
    minimum_duration: Union[None, Unset, int] = UNSET
    maximum_duration: Union[None, Unset, int] = UNSET
    recovery_duration: Union[None, Unset, int] = UNSET
    ramp_rate: Union[None, Unset, float] = UNSET
    grid_node_id: Union[None, Unset, str] = UNSET
    grid_validation_status: Union[Unset, ControllableUnitGridValidationStatus] = UNSET
    grid_validation_notes: Union[None, Unset, str] = UNSET
    validated_at: Union[None, Unset, str] = UNSET
    accounting_point_id: Union[Unset, int] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        name = self.name

        start_date: Union[None, Unset, str]
        if isinstance(self.start_date, Unset):
            start_date = UNSET
        elif isinstance(self.start_date, datetime.date):
            start_date = self.start_date.isoformat()
        else:
            start_date = self.start_date

        status: Union[Unset, str] = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        regulation_direction: Union[Unset, str] = UNSET
        if not isinstance(self.regulation_direction, Unset):
            regulation_direction = self.regulation_direction.value

        maximum_available_capacity = self.maximum_available_capacity

        minimum_duration: Union[None, Unset, int]
        if isinstance(self.minimum_duration, Unset):
            minimum_duration = UNSET
        else:
            minimum_duration = self.minimum_duration

        maximum_duration: Union[None, Unset, int]
        if isinstance(self.maximum_duration, Unset):
            maximum_duration = UNSET
        else:
            maximum_duration = self.maximum_duration

        recovery_duration: Union[None, Unset, int]
        if isinstance(self.recovery_duration, Unset):
            recovery_duration = UNSET
        else:
            recovery_duration = self.recovery_duration

        ramp_rate: Union[None, Unset, float]
        if isinstance(self.ramp_rate, Unset):
            ramp_rate = UNSET
        else:
            ramp_rate = self.ramp_rate

        grid_node_id: Union[None, Unset, str]
        if isinstance(self.grid_node_id, Unset):
            grid_node_id = UNSET
        else:
            grid_node_id = self.grid_node_id

        grid_validation_status: Union[Unset, str] = UNSET
        if not isinstance(self.grid_validation_status, Unset):
            grid_validation_status = self.grid_validation_status.value

        grid_validation_notes: Union[None, Unset, str]
        if isinstance(self.grid_validation_notes, Unset):
            grid_validation_notes = UNSET
        else:
            grid_validation_notes = self.grid_validation_notes

        validated_at: Union[None, Unset, str]
        if isinstance(self.validated_at, Unset):
            validated_at = UNSET
        else:
            validated_at = self.validated_at

        accounting_point_id = self.accounting_point_id

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if name is not UNSET:
            field_dict["name"] = name
        if start_date is not UNSET:
            field_dict["start_date"] = start_date
        if status is not UNSET:
            field_dict["status"] = status
        if regulation_direction is not UNSET:
            field_dict["regulation_direction"] = regulation_direction
        if maximum_available_capacity is not UNSET:
            field_dict["maximum_available_capacity"] = maximum_available_capacity
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
        if grid_validation_status is not UNSET:
            field_dict["grid_validation_status"] = grid_validation_status
        if grid_validation_notes is not UNSET:
            field_dict["grid_validation_notes"] = grid_validation_notes
        if validated_at is not UNSET:
            field_dict["validated_at"] = validated_at
        if accounting_point_id is not UNSET:
            field_dict["accounting_point_id"] = accounting_point_id

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        name = d.pop("name", UNSET)

        def _parse_start_date(data: object) -> Union[None, Unset, datetime.date]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                start_date_type_0 = isoparse(data).date()

                return start_date_type_0
            except:  # noqa: E722
                pass
            return cast(Union[None, Unset, datetime.date], data)

        start_date = _parse_start_date(d.pop("start_date", UNSET))

        _status = d.pop("status", UNSET)
        status: Union[Unset, ControllableUnitStatus]
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = ControllableUnitStatus(_status)

        _regulation_direction = d.pop("regulation_direction", UNSET)
        regulation_direction: Union[Unset, ControllableUnitRegulationDirection]
        if isinstance(_regulation_direction, Unset):
            regulation_direction = UNSET
        else:
            regulation_direction = ControllableUnitRegulationDirection(_regulation_direction)

        maximum_available_capacity = d.pop("maximum_available_capacity", UNSET)

        def _parse_minimum_duration(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        minimum_duration = _parse_minimum_duration(d.pop("minimum_duration", UNSET))

        def _parse_maximum_duration(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        maximum_duration = _parse_maximum_duration(d.pop("maximum_duration", UNSET))

        def _parse_recovery_duration(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        recovery_duration = _parse_recovery_duration(d.pop("recovery_duration", UNSET))

        def _parse_ramp_rate(data: object) -> Union[None, Unset, float]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, float], data)

        ramp_rate = _parse_ramp_rate(d.pop("ramp_rate", UNSET))

        def _parse_grid_node_id(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        grid_node_id = _parse_grid_node_id(d.pop("grid_node_id", UNSET))

        _grid_validation_status = d.pop("grid_validation_status", UNSET)
        grid_validation_status: Union[Unset, ControllableUnitGridValidationStatus]
        if isinstance(_grid_validation_status, Unset):
            grid_validation_status = UNSET
        else:
            grid_validation_status = ControllableUnitGridValidationStatus(_grid_validation_status)

        def _parse_grid_validation_notes(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        grid_validation_notes = _parse_grid_validation_notes(d.pop("grid_validation_notes", UNSET))

        def _parse_validated_at(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        validated_at = _parse_validated_at(d.pop("validated_at", UNSET))

        accounting_point_id = d.pop("accounting_point_id", UNSET)

        controllable_unit_create_request = cls(
            name=name,
            start_date=start_date,
            status=status,
            regulation_direction=regulation_direction,
            maximum_available_capacity=maximum_available_capacity,
            minimum_duration=minimum_duration,
            maximum_duration=maximum_duration,
            recovery_duration=recovery_duration,
            ramp_rate=ramp_rate,
            grid_node_id=grid_node_id,
            grid_validation_status=grid_validation_status,
            grid_validation_notes=grid_validation_notes,
            validated_at=validated_at,
            accounting_point_id=accounting_point_id,
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
