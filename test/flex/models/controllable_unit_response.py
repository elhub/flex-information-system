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
    from ..models.accounting_point_response import AccountingPointResponse
    from ..models.controllable_unit_service_provider_response import ControllableUnitServiceProviderResponse
    from ..models.controllable_unit_summary_response import ControllableUnitSummaryResponse
    from ..models.controllable_unit_suspension_response import ControllableUnitSuspensionResponse
    from ..models.service_providing_group_membership_response import ServiceProvidingGroupMembershipResponse
    from ..models.technical_resource_response import TechnicalResourceResponse


T = TypeVar("T", bound="ControllableUnitResponse")


@_attrs_define
class ControllableUnitResponse:
    """Response schema - Controllable unit

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
        start_date (datetime.date | None | Unset): The usage date when the controllable unit is first active. Example:
            2024-05-17.
        additional_information (None | str | Unset): Free text field for extra information about the controllable unit
            if needed.
        accounting_point (AccountingPointResponse | None | Unset): Embedded accounting_point
        suspension (list[ControllableUnitSuspensionResponse] | None | Unset): Embedded controllable_unit_suspension
        service_provider (list[ControllableUnitServiceProviderResponse] | None | Unset): Embedded
            controllable_unit_service_provider
        summary (ControllableUnitSummaryResponse | None | Unset): Embedded controllable_unit_summary
        service_providing_group_membership (list[ServiceProvidingGroupMembershipResponse] | None | Unset): Embedded
            service_providing_group_membership
        technical_resource (list[TechnicalResourceResponse] | None | Unset): Embedded technical_resource
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
    start_date: datetime.date | None | Unset = UNSET
    additional_information: None | str | Unset = UNSET
    accounting_point: AccountingPointResponse | None | Unset = UNSET
    suspension: list[ControllableUnitSuspensionResponse] | None | Unset = UNSET
    service_provider: list[ControllableUnitServiceProviderResponse] | None | Unset = UNSET
    summary: ControllableUnitSummaryResponse | None | Unset = UNSET
    service_providing_group_membership: list[ServiceProvidingGroupMembershipResponse] | None | Unset = UNSET
    technical_resource: list[TechnicalResourceResponse] | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.accounting_point_response import AccountingPointResponse
        from ..models.controllable_unit_summary_response import ControllableUnitSummaryResponse

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

        accounting_point: dict[str, Any] | None | Unset
        if isinstance(self.accounting_point, Unset):
            accounting_point = UNSET
        elif isinstance(self.accounting_point, AccountingPointResponse):
            accounting_point = self.accounting_point.to_dict()
        else:
            accounting_point = self.accounting_point

        suspension: list[dict[str, Any]] | None | Unset
        if isinstance(self.suspension, Unset):
            suspension = UNSET
        elif isinstance(self.suspension, list):
            suspension = []
            for suspension_type_0_item_data in self.suspension:
                suspension_type_0_item = suspension_type_0_item_data.to_dict()
                suspension.append(suspension_type_0_item)

        else:
            suspension = self.suspension

        service_provider: list[dict[str, Any]] | None | Unset
        if isinstance(self.service_provider, Unset):
            service_provider = UNSET
        elif isinstance(self.service_provider, list):
            service_provider = []
            for service_provider_type_0_item_data in self.service_provider:
                service_provider_type_0_item = service_provider_type_0_item_data.to_dict()
                service_provider.append(service_provider_type_0_item)

        else:
            service_provider = self.service_provider

        summary: dict[str, Any] | None | Unset
        if isinstance(self.summary, Unset):
            summary = UNSET
        elif isinstance(self.summary, ControllableUnitSummaryResponse):
            summary = self.summary.to_dict()
        else:
            summary = self.summary

        service_providing_group_membership: list[dict[str, Any]] | None | Unset
        if isinstance(self.service_providing_group_membership, Unset):
            service_providing_group_membership = UNSET
        elif isinstance(self.service_providing_group_membership, list):
            service_providing_group_membership = []
            for service_providing_group_membership_type_0_item_data in self.service_providing_group_membership:
                service_providing_group_membership_type_0_item = (
                    service_providing_group_membership_type_0_item_data.to_dict()
                )
                service_providing_group_membership.append(service_providing_group_membership_type_0_item)

        else:
            service_providing_group_membership = self.service_providing_group_membership

        technical_resource: list[dict[str, Any]] | None | Unset
        if isinstance(self.technical_resource, Unset):
            technical_resource = UNSET
        elif isinstance(self.technical_resource, list):
            technical_resource = []
            for technical_resource_type_0_item_data in self.technical_resource:
                technical_resource_type_0_item = technical_resource_type_0_item_data.to_dict()
                technical_resource.append(technical_resource_type_0_item)

        else:
            technical_resource = self.technical_resource

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
            }
        )
        if start_date is not UNSET:
            field_dict["start_date"] = start_date
        if additional_information is not UNSET:
            field_dict["additional_information"] = additional_information
        if accounting_point is not UNSET:
            field_dict["accounting_point"] = accounting_point
        if suspension is not UNSET:
            field_dict["suspension"] = suspension
        if service_provider is not UNSET:
            field_dict["service_provider"] = service_provider
        if summary is not UNSET:
            field_dict["summary"] = summary
        if service_providing_group_membership is not UNSET:
            field_dict["service_providing_group_membership"] = service_providing_group_membership
        if technical_resource is not UNSET:
            field_dict["technical_resource"] = technical_resource

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.accounting_point_response import AccountingPointResponse
        from ..models.controllable_unit_service_provider_response import ControllableUnitServiceProviderResponse
        from ..models.controllable_unit_summary_response import ControllableUnitSummaryResponse
        from ..models.controllable_unit_suspension_response import ControllableUnitSuspensionResponse
        from ..models.service_providing_group_membership_response import ServiceProvidingGroupMembershipResponse
        from ..models.technical_resource_response import TechnicalResourceResponse

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

        def _parse_suspension(data: object) -> list[ControllableUnitSuspensionResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                suspension_type_0 = []
                _suspension_type_0 = data
                for suspension_type_0_item_data in _suspension_type_0:
                    suspension_type_0_item = ControllableUnitSuspensionResponse.from_dict(suspension_type_0_item_data)

                    suspension_type_0.append(suspension_type_0_item)

                return suspension_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[ControllableUnitSuspensionResponse] | None | Unset, data)

        suspension = _parse_suspension(d.pop("suspension", UNSET))

        def _parse_service_provider(data: object) -> list[ControllableUnitServiceProviderResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                service_provider_type_0 = []
                _service_provider_type_0 = data
                for service_provider_type_0_item_data in _service_provider_type_0:
                    service_provider_type_0_item = ControllableUnitServiceProviderResponse.from_dict(
                        service_provider_type_0_item_data
                    )

                    service_provider_type_0.append(service_provider_type_0_item)

                return service_provider_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[ControllableUnitServiceProviderResponse] | None | Unset, data)

        service_provider = _parse_service_provider(d.pop("service_provider", UNSET))

        def _parse_summary(data: object) -> ControllableUnitSummaryResponse | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                summary_type_0 = ControllableUnitSummaryResponse.from_dict(data)

                return summary_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(ControllableUnitSummaryResponse | None | Unset, data)

        summary = _parse_summary(d.pop("summary", UNSET))

        def _parse_service_providing_group_membership(
            data: object,
        ) -> list[ServiceProvidingGroupMembershipResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                service_providing_group_membership_type_0 = []
                _service_providing_group_membership_type_0 = data
                for service_providing_group_membership_type_0_item_data in _service_providing_group_membership_type_0:
                    service_providing_group_membership_type_0_item = ServiceProvidingGroupMembershipResponse.from_dict(
                        service_providing_group_membership_type_0_item_data
                    )

                    service_providing_group_membership_type_0.append(service_providing_group_membership_type_0_item)

                return service_providing_group_membership_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[ServiceProvidingGroupMembershipResponse] | None | Unset, data)

        service_providing_group_membership = _parse_service_providing_group_membership(
            d.pop("service_providing_group_membership", UNSET)
        )

        def _parse_technical_resource(data: object) -> list[TechnicalResourceResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                technical_resource_type_0 = []
                _technical_resource_type_0 = data
                for technical_resource_type_0_item_data in _technical_resource_type_0:
                    technical_resource_type_0_item = TechnicalResourceResponse.from_dict(
                        technical_resource_type_0_item_data
                    )

                    technical_resource_type_0.append(technical_resource_type_0_item)

                return technical_resource_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[TechnicalResourceResponse] | None | Unset, data)

        technical_resource = _parse_technical_resource(d.pop("technical_resource", UNSET))

        controllable_unit_response = cls(
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
            start_date=start_date,
            additional_information=additional_information,
            accounting_point=accounting_point,
            suspension=suspension,
            service_provider=service_provider,
            summary=summary,
            service_providing_group_membership=service_providing_group_membership,
            technical_resource=technical_resource,
        )

        controllable_unit_response.additional_properties = d
        return controllable_unit_response

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
