from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..models.controllable_unit_regulation_direction import ControllableUnitRegulationDirection
from ..models.controllable_unit_status import ControllableUnitStatus
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.accounting_point_response import AccountingPointResponse
    from ..models.controllable_unit_service_provider_response import ControllableUnitServiceProviderResponse
    from ..models.controllable_unit_suspension_response import ControllableUnitSuspensionResponse
    from ..models.service_providing_group_membership_response import ServiceProvidingGroupMembershipResponse
    from ..models.technical_resource_response import TechnicalResourceResponse


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
        maximum_active_power (float): Maximum continuous active power that the controllable unit can produce or consume,
            i.e. deliver for balancing and congestion services, in kilowatts. Example: 3.5.
        is_small (bool): Whether the controllable unit is small or not, following NCDR. Example: True.
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
        accounting_point (AccountingPointResponse | None | Unset): Embedded accounting_point
        suspension (ControllableUnitSuspensionResponse | None | Unset): Embedded controllable_unit_suspension
        service_provider (ControllableUnitServiceProviderResponse | None | Unset): Embedded
            controllable_unit_service_provider
        service_providing_group_membership (None | ServiceProvidingGroupMembershipResponse | Unset): Embedded
            service_providing_group_membership
        technical_resource (None | TechnicalResourceResponse | Unset): Embedded technical_resource
        replaced_by (int | None | Unset): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (datetime.datetime | None | Unset): When the resource was replaced in the system. Example:
            2024-07-07T10:00:00+00:00.
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
    accounting_point: AccountingPointResponse | None | Unset = UNSET
    suspension: ControllableUnitSuspensionResponse | None | Unset = UNSET
    service_provider: ControllableUnitServiceProviderResponse | None | Unset = UNSET
    service_providing_group_membership: None | ServiceProvidingGroupMembershipResponse | Unset = UNSET
    technical_resource: None | TechnicalResourceResponse | Unset = UNSET
    replaced_by: int | None | Unset = UNSET
    replaced_at: datetime.datetime | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.accounting_point_response import AccountingPointResponse
        from ..models.controllable_unit_service_provider_response import ControllableUnitServiceProviderResponse
        from ..models.controllable_unit_suspension_response import ControllableUnitSuspensionResponse
        from ..models.service_providing_group_membership_response import ServiceProvidingGroupMembershipResponse
        from ..models.technical_resource_response import TechnicalResourceResponse

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

        accounting_point: dict[str, Any] | None | Unset
        if isinstance(self.accounting_point, Unset):
            accounting_point = UNSET
        elif isinstance(self.accounting_point, AccountingPointResponse):
            accounting_point = self.accounting_point.to_dict()
        else:
            accounting_point = self.accounting_point

        suspension: dict[str, Any] | None | Unset
        if isinstance(self.suspension, Unset):
            suspension = UNSET
        elif isinstance(self.suspension, ControllableUnitSuspensionResponse):
            suspension = self.suspension.to_dict()
        else:
            suspension = self.suspension

        service_provider: dict[str, Any] | None | Unset
        if isinstance(self.service_provider, Unset):
            service_provider = UNSET
        elif isinstance(self.service_provider, ControllableUnitServiceProviderResponse):
            service_provider = self.service_provider.to_dict()
        else:
            service_provider = self.service_provider

        service_providing_group_membership: dict[str, Any] | None | Unset
        if isinstance(self.service_providing_group_membership, Unset):
            service_providing_group_membership = UNSET
        elif isinstance(self.service_providing_group_membership, ServiceProvidingGroupMembershipResponse):
            service_providing_group_membership = self.service_providing_group_membership.to_dict()
        else:
            service_providing_group_membership = self.service_providing_group_membership

        technical_resource: dict[str, Any] | None | Unset
        if isinstance(self.technical_resource, Unset):
            technical_resource = UNSET
        elif isinstance(self.technical_resource, TechnicalResourceResponse):
            technical_resource = self.technical_resource.to_dict()
        else:
            technical_resource = self.technical_resource

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
        if accounting_point is not UNSET:
            field_dict["accounting_point"] = accounting_point
        if suspension is not UNSET:
            field_dict["suspension"] = suspension
        if service_provider is not UNSET:
            field_dict["service_provider"] = service_provider
        if service_providing_group_membership is not UNSET:
            field_dict["service_providing_group_membership"] = service_providing_group_membership
        if technical_resource is not UNSET:
            field_dict["technical_resource"] = technical_resource
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.accounting_point_response import AccountingPointResponse
        from ..models.controllable_unit_service_provider_response import ControllableUnitServiceProviderResponse
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

        recorded_at = isoparse(d.pop("recorded_at"))

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

        def _parse_suspension(data: object) -> ControllableUnitSuspensionResponse | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                suspension_type_0 = ControllableUnitSuspensionResponse.from_dict(data)

                return suspension_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(ControllableUnitSuspensionResponse | None | Unset, data)

        suspension = _parse_suspension(d.pop("suspension", UNSET))

        def _parse_service_provider(data: object) -> ControllableUnitServiceProviderResponse | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                service_provider_type_0 = ControllableUnitServiceProviderResponse.from_dict(data)

                return service_provider_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(ControllableUnitServiceProviderResponse | None | Unset, data)

        service_provider = _parse_service_provider(d.pop("service_provider", UNSET))

        def _parse_service_providing_group_membership(
            data: object,
        ) -> None | ServiceProvidingGroupMembershipResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                service_providing_group_membership_type_0 = ServiceProvidingGroupMembershipResponse.from_dict(data)

                return service_providing_group_membership_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | ServiceProvidingGroupMembershipResponse | Unset, data)

        service_providing_group_membership = _parse_service_providing_group_membership(
            d.pop("service_providing_group_membership", UNSET)
        )

        def _parse_technical_resource(data: object) -> None | TechnicalResourceResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                technical_resource_type_0 = TechnicalResourceResponse.from_dict(data)

                return technical_resource_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | TechnicalResourceResponse | Unset, data)

        technical_resource = _parse_technical_resource(d.pop("technical_resource", UNSET))

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
                replaced_at_type_0 = isoparse(data)

                return replaced_at_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.datetime | None | Unset, data)

        replaced_at = _parse_replaced_at(d.pop("replaced_at", UNSET))

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
            accounting_point=accounting_point,
            suspension=suspension,
            service_provider=service_provider,
            service_providing_group_membership=service_providing_group_membership,
            technical_resource=technical_resource,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
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
