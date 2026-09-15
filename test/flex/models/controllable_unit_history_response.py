from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.controllable_unit_regulation_direction import ControllableUnitRegulationDirection
from ..models.controllable_unit_status import ControllableUnitStatus
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.controllable_unit_service_provider_history_response import (
        ControllableUnitServiceProviderHistoryResponse,
    )
    from ..models.controllable_unit_suspension_history_response import ControllableUnitSuspensionHistoryResponse
    from ..models.service_providing_group_membership_history_response import (
        ServiceProvidingGroupMembershipHistoryResponse,
    )
    from ..models.technical_resource_history_response import TechnicalResourceHistoryResponse


T = TypeVar("T", bound="ControllableUnitHistoryResponse")


@_attrs_define
class ControllableUnitHistoryResponse:
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
        maximum_active_power (float): Maximum continuous active power (flexible power) that the controllable unit can
            produce or consume, i.e. deliver for balancing and congestion services, in kilowatts. Example: 3.5.
        is_small (bool): Whether the controllable unit is small or not, following NCDR. Current threshold for this to be
            true is <= 50 kW of flexible power. Example: True.
        accounting_point_id (int): Reference to the accounting point that the controllable unit is connected to.
            Example: 10289.
        recorded_at (datetime.datetime): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31T23:59:00+00:00.
        recorded_by (int): The identity that recorded the resource. Example: 145.
        controllable_unit_id (int): Reference to the resource that was updated. Example: 48.
        start_date (datetime.date | None | Unset): The usage date when the controllable unit is first active. Example:
            2024-05-17.
        additional_information (None | str | Unset): Free text field for extra information about the controllable unit
            if needed.
        replaced_by (int | None | Unset): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (datetime.datetime | None | Unset): When the resource was replaced in the system. Example:
            2024-07-07T10:00:00+00:00.
        suspension_history (list[ControllableUnitSuspensionHistoryResponse] | None | Unset): Embedded
            controllable_unit_suspension_history
        service_provider_history (list[ControllableUnitServiceProviderHistoryResponse] | None | Unset): Embedded
            controllable_unit_service_provider_history
        service_providing_group_membership_history (list[ServiceProvidingGroupMembershipHistoryResponse] | None |
            Unset): Embedded service_providing_group_membership_history
        technical_resource_history (list[TechnicalResourceHistoryResponse] | None | Unset): Embedded
            technical_resource_history
    """

    id: int
    business_id: str
    name: str
    status: ControllableUnitStatus
    regulation_direction: ControllableUnitRegulationDirection
    maximum_active_power: float
    is_small: bool
    accounting_point_id: int
    recorded_at: datetime.datetime
    recorded_by: int
    controllable_unit_id: int
    start_date: datetime.date | None | Unset = UNSET
    additional_information: None | str | Unset = UNSET
    replaced_by: int | None | Unset = UNSET
    replaced_at: datetime.datetime | None | Unset = UNSET
    suspension_history: list[ControllableUnitSuspensionHistoryResponse] | None | Unset = UNSET
    service_provider_history: list[ControllableUnitServiceProviderHistoryResponse] | None | Unset = UNSET
    service_providing_group_membership_history: list[ServiceProvidingGroupMembershipHistoryResponse] | None | Unset = (
        UNSET
    )
    technical_resource_history: list[TechnicalResourceHistoryResponse] | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        business_id = self.business_id

        name = self.name

        status = self.status.value

        regulation_direction = self.regulation_direction.value

        maximum_active_power = self.maximum_active_power

        is_small = self.is_small

        accounting_point_id = self.accounting_point_id

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        controllable_unit_id = self.controllable_unit_id

        start_date: None | str | Unset
        if isinstance(self.start_date, Unset):
            start_date = UNSET
        elif isinstance(self.start_date, datetime.date):
            start_date = self.start_date.isoformat()
        else:
            start_date = self.start_date

        additional_information: None | str | Unset
        if isinstance(self.additional_information, Unset):
            additional_information = UNSET
        else:
            additional_information = self.additional_information

        replaced_by: int | None | Unset
        if isinstance(self.replaced_by, Unset):
            replaced_by = UNSET
        else:
            replaced_by = self.replaced_by

        replaced_at: None | str | Unset
        if isinstance(self.replaced_at, Unset):
            replaced_at = UNSET
        elif isinstance(self.replaced_at, datetime.datetime):
            replaced_at = self.replaced_at.isoformat()
        else:
            replaced_at = self.replaced_at

        suspension_history: list[dict[str, Any]] | None | Unset
        if isinstance(self.suspension_history, Unset):
            suspension_history = UNSET
        elif isinstance(self.suspension_history, list):
            suspension_history = []
            for suspension_history_type_0_item_data in self.suspension_history:
                suspension_history_type_0_item = suspension_history_type_0_item_data.to_dict()
                suspension_history.append(suspension_history_type_0_item)

        else:
            suspension_history = self.suspension_history

        service_provider_history: list[dict[str, Any]] | None | Unset
        if isinstance(self.service_provider_history, Unset):
            service_provider_history = UNSET
        elif isinstance(self.service_provider_history, list):
            service_provider_history = []
            for service_provider_history_type_0_item_data in self.service_provider_history:
                service_provider_history_type_0_item = service_provider_history_type_0_item_data.to_dict()
                service_provider_history.append(service_provider_history_type_0_item)

        else:
            service_provider_history = self.service_provider_history

        service_providing_group_membership_history: list[dict[str, Any]] | None | Unset
        if isinstance(self.service_providing_group_membership_history, Unset):
            service_providing_group_membership_history = UNSET
        elif isinstance(self.service_providing_group_membership_history, list):
            service_providing_group_membership_history = []
            for (
                service_providing_group_membership_history_type_0_item_data
            ) in self.service_providing_group_membership_history:
                service_providing_group_membership_history_type_0_item = (
                    service_providing_group_membership_history_type_0_item_data.to_dict()
                )
                service_providing_group_membership_history.append(
                    service_providing_group_membership_history_type_0_item
                )

        else:
            service_providing_group_membership_history = self.service_providing_group_membership_history

        technical_resource_history: list[dict[str, Any]] | None | Unset
        if isinstance(self.technical_resource_history, Unset):
            technical_resource_history = UNSET
        elif isinstance(self.technical_resource_history, list):
            technical_resource_history = []
            for technical_resource_history_type_0_item_data in self.technical_resource_history:
                technical_resource_history_type_0_item = technical_resource_history_type_0_item_data.to_dict()
                technical_resource_history.append(technical_resource_history_type_0_item)

        else:
            technical_resource_history = self.technical_resource_history

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "business_id": business_id,
                "name": name,
                "status": status,
                "regulation_direction": regulation_direction,
                "maximum_active_power": maximum_active_power,
                "is_small": is_small,
                "accounting_point_id": accounting_point_id,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
                "controllable_unit_id": controllable_unit_id,
            }
        )
        if start_date is not UNSET:
            field_dict["start_date"] = start_date
        if additional_information is not UNSET:
            field_dict["additional_information"] = additional_information
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at
        if suspension_history is not UNSET:
            field_dict["suspension_history"] = suspension_history
        if service_provider_history is not UNSET:
            field_dict["service_provider_history"] = service_provider_history
        if service_providing_group_membership_history is not UNSET:
            field_dict["service_providing_group_membership_history"] = service_providing_group_membership_history
        if technical_resource_history is not UNSET:
            field_dict["technical_resource_history"] = technical_resource_history

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.controllable_unit_service_provider_history_response import (
            ControllableUnitServiceProviderHistoryResponse,
        )
        from ..models.controllable_unit_suspension_history_response import ControllableUnitSuspensionHistoryResponse
        from ..models.service_providing_group_membership_history_response import (
            ServiceProvidingGroupMembershipHistoryResponse,
        )
        from ..models.technical_resource_history_response import TechnicalResourceHistoryResponse

        d = dict(src_dict)
        id = d.pop("id")

        business_id = d.pop("business_id")

        name = d.pop("name")

        status = ControllableUnitStatus(d.pop("status"))

        regulation_direction = ControllableUnitRegulationDirection(d.pop("regulation_direction"))

        maximum_active_power = d.pop("maximum_active_power")

        is_small = d.pop("is_small")

        accounting_point_id = d.pop("accounting_point_id")

        recorded_at = datetime.datetime.fromisoformat(d.pop("recorded_at"))

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
                start_date_type_0 = datetime.date.fromisoformat(data)

                return start_date_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.date | None | Unset, data)

        start_date = _parse_start_date(d.pop("start_date", UNSET))

        def _parse_additional_information(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        additional_information = _parse_additional_information(d.pop("additional_information", UNSET))

        def _parse_replaced_by(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        replaced_by = _parse_replaced_by(d.pop("replaced_by", UNSET))

        def _parse_replaced_at(data: object) -> datetime.datetime | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                replaced_at_type_0 = datetime.datetime.fromisoformat(data)

                return replaced_at_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.datetime | None | Unset, data)

        replaced_at = _parse_replaced_at(d.pop("replaced_at", UNSET))

        def _parse_suspension_history(data: object) -> list[ControllableUnitSuspensionHistoryResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                suspension_history_type_0 = []
                _suspension_history_type_0 = data
                for suspension_history_type_0_item_data in _suspension_history_type_0:
                    suspension_history_type_0_item = ControllableUnitSuspensionHistoryResponse.from_dict(
                        suspension_history_type_0_item_data
                    )

                    suspension_history_type_0.append(suspension_history_type_0_item)

                return suspension_history_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[ControllableUnitSuspensionHistoryResponse] | None | Unset, data)

        suspension_history = _parse_suspension_history(d.pop("suspension_history", UNSET))

        def _parse_service_provider_history(
            data: object,
        ) -> list[ControllableUnitServiceProviderHistoryResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                service_provider_history_type_0 = []
                _service_provider_history_type_0 = data
                for service_provider_history_type_0_item_data in _service_provider_history_type_0:
                    service_provider_history_type_0_item = ControllableUnitServiceProviderHistoryResponse.from_dict(
                        service_provider_history_type_0_item_data
                    )

                    service_provider_history_type_0.append(service_provider_history_type_0_item)

                return service_provider_history_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[ControllableUnitServiceProviderHistoryResponse] | None | Unset, data)

        service_provider_history = _parse_service_provider_history(d.pop("service_provider_history", UNSET))

        def _parse_service_providing_group_membership_history(
            data: object,
        ) -> list[ServiceProvidingGroupMembershipHistoryResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                service_providing_group_membership_history_type_0 = []
                _service_providing_group_membership_history_type_0 = data
                for (
                    service_providing_group_membership_history_type_0_item_data
                ) in _service_providing_group_membership_history_type_0:
                    service_providing_group_membership_history_type_0_item = (
                        ServiceProvidingGroupMembershipHistoryResponse.from_dict(
                            service_providing_group_membership_history_type_0_item_data
                        )
                    )

                    service_providing_group_membership_history_type_0.append(
                        service_providing_group_membership_history_type_0_item
                    )

                return service_providing_group_membership_history_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[ServiceProvidingGroupMembershipHistoryResponse] | None | Unset, data)

        service_providing_group_membership_history = _parse_service_providing_group_membership_history(
            d.pop("service_providing_group_membership_history", UNSET)
        )

        def _parse_technical_resource_history(data: object) -> list[TechnicalResourceHistoryResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                technical_resource_history_type_0 = []
                _technical_resource_history_type_0 = data
                for technical_resource_history_type_0_item_data in _technical_resource_history_type_0:
                    technical_resource_history_type_0_item = TechnicalResourceHistoryResponse.from_dict(
                        technical_resource_history_type_0_item_data
                    )

                    technical_resource_history_type_0.append(technical_resource_history_type_0_item)

                return technical_resource_history_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[TechnicalResourceHistoryResponse] | None | Unset, data)

        technical_resource_history = _parse_technical_resource_history(d.pop("technical_resource_history", UNSET))

        controllable_unit_history_response = cls(
            id=id,
            business_id=business_id,
            name=name,
            status=status,
            regulation_direction=regulation_direction,
            maximum_active_power=maximum_active_power,
            is_small=is_small,
            accounting_point_id=accounting_point_id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            controllable_unit_id=controllable_unit_id,
            start_date=start_date,
            additional_information=additional_information,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
            suspension_history=suspension_history,
            service_provider_history=service_provider_history,
            service_providing_group_membership_history=service_providing_group_membership_history,
            technical_resource_history=technical_resource_history,
        )

        controllable_unit_history_response.additional_properties = d
        return controllable_unit_history_response

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
