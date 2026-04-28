from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..models.service_providing_group_bidding_zone import ServiceProvidingGroupBiddingZone
from ..models.service_providing_group_status import ServiceProvidingGroupStatus
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.party_response import PartyResponse
    from ..models.service_providing_group_grid_prequalification_response import (
        ServiceProvidingGroupGridPrequalificationResponse,
    )
    from ..models.service_providing_group_grid_suspension_response import ServiceProvidingGroupGridSuspensionResponse
    from ..models.service_providing_group_membership_response import ServiceProvidingGroupMembershipResponse
    from ..models.service_providing_group_product_application_response import (
        ServiceProvidingGroupProductApplicationResponse,
    )
    from ..models.service_providing_group_product_suspension_response import (
        ServiceProvidingGroupProductSuspensionResponse,
    )
    from ..models.service_providing_group_summary_response import ServiceProvidingGroupSummaryResponse


T = TypeVar("T", bound="ServiceProvidingGroupResponse")


@_attrs_define
class ServiceProvidingGroupResponse:
    """Response schema - Group of controllable units

    Attributes:
        id (int): Unique surrogate key. Example: 4.
        name (str): Free text name of the service providing group. Example: Batteries #09.
        service_provider_id (int): Reference to the `party` (service provider) managing the group. Example: 17.
        bidding_zone (ServiceProvidingGroupBiddingZone): The bidding zone that restricts which CUs that can be added to
            the group. Also known as scheduling area or price area for TSO. Example: NO3.
        status (ServiceProvidingGroupStatus): The status of the group. Example: active.
        recorded_at (datetime.datetime): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31T23:59:00+00:00.
        recorded_by (int): The identity that recorded the resource. Example: 145.
        additional_information (None | str | Unset): Free text field for extra information about the service providing
            group if needed.
        summary (None | ServiceProvidingGroupSummaryResponse | Unset): Embedded service_providing_group_summary
        service_provider (None | PartyResponse | Unset): Embedded party
        membership (list[ServiceProvidingGroupMembershipResponse] | None | Unset): Embedded
            service_providing_group_membership
        grid_prequalification (list[ServiceProvidingGroupGridPrequalificationResponse] | None | Unset): Embedded
            service_providing_group_grid_prequalification
        grid_suspension (list[ServiceProvidingGroupGridSuspensionResponse] | None | Unset): Embedded
            service_providing_group_grid_suspension
        product_application (list[ServiceProvidingGroupProductApplicationResponse] | None | Unset): Embedded
            service_providing_group_product_application
        product_suspension (list[ServiceProvidingGroupProductSuspensionResponse] | None | Unset): Embedded
            service_providing_group_product_suspension
    """

    id: int
    name: str
    service_provider_id: int
    bidding_zone: ServiceProvidingGroupBiddingZone
    status: ServiceProvidingGroupStatus
    recorded_at: datetime.datetime
    recorded_by: int
    additional_information: None | str | Unset = UNSET
    summary: None | ServiceProvidingGroupSummaryResponse | Unset = UNSET
    service_provider: None | PartyResponse | Unset = UNSET
    membership: list[ServiceProvidingGroupMembershipResponse] | None | Unset = UNSET
    grid_prequalification: list[ServiceProvidingGroupGridPrequalificationResponse] | None | Unset = UNSET
    grid_suspension: list[ServiceProvidingGroupGridSuspensionResponse] | None | Unset = UNSET
    product_application: list[ServiceProvidingGroupProductApplicationResponse] | None | Unset = UNSET
    product_suspension: list[ServiceProvidingGroupProductSuspensionResponse] | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.party_response import PartyResponse
        from ..models.service_providing_group_summary_response import ServiceProvidingGroupSummaryResponse

        id = self.id

        name = self.name

        service_provider_id = self.service_provider_id

        bidding_zone = self.bidding_zone.value

        status = self.status.value

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        additional_information: None | str | Unset
        if isinstance(self.additional_information, Unset):
            additional_information = UNSET
        else:
            additional_information = self.additional_information

        summary: dict[str, Any] | None | Unset
        if isinstance(self.summary, Unset):
            summary = UNSET
        elif isinstance(self.summary, ServiceProvidingGroupSummaryResponse):
            summary = self.summary.to_dict()
        else:
            summary = self.summary

        service_provider: dict[str, Any] | None | Unset
        if isinstance(self.service_provider, Unset):
            service_provider = UNSET
        elif isinstance(self.service_provider, PartyResponse):
            service_provider = self.service_provider.to_dict()
        else:
            service_provider = self.service_provider

        membership: list[dict[str, Any]] | None | Unset
        if isinstance(self.membership, Unset):
            membership = UNSET
        elif isinstance(self.membership, list):
            membership = []
            for membership_type_0_item_data in self.membership:
                membership_type_0_item = membership_type_0_item_data.to_dict()
                membership.append(membership_type_0_item)

        else:
            membership = self.membership

        grid_prequalification: list[dict[str, Any]] | None | Unset
        if isinstance(self.grid_prequalification, Unset):
            grid_prequalification = UNSET
        elif isinstance(self.grid_prequalification, list):
            grid_prequalification = []
            for grid_prequalification_type_0_item_data in self.grid_prequalification:
                grid_prequalification_type_0_item = grid_prequalification_type_0_item_data.to_dict()
                grid_prequalification.append(grid_prequalification_type_0_item)

        else:
            grid_prequalification = self.grid_prequalification

        grid_suspension: list[dict[str, Any]] | None | Unset
        if isinstance(self.grid_suspension, Unset):
            grid_suspension = UNSET
        elif isinstance(self.grid_suspension, list):
            grid_suspension = []
            for grid_suspension_type_0_item_data in self.grid_suspension:
                grid_suspension_type_0_item = grid_suspension_type_0_item_data.to_dict()
                grid_suspension.append(grid_suspension_type_0_item)

        else:
            grid_suspension = self.grid_suspension

        product_application: list[dict[str, Any]] | None | Unset
        if isinstance(self.product_application, Unset):
            product_application = UNSET
        elif isinstance(self.product_application, list):
            product_application = []
            for product_application_type_0_item_data in self.product_application:
                product_application_type_0_item = product_application_type_0_item_data.to_dict()
                product_application.append(product_application_type_0_item)

        else:
            product_application = self.product_application

        product_suspension: list[dict[str, Any]] | None | Unset
        if isinstance(self.product_suspension, Unset):
            product_suspension = UNSET
        elif isinstance(self.product_suspension, list):
            product_suspension = []
            for product_suspension_type_0_item_data in self.product_suspension:
                product_suspension_type_0_item = product_suspension_type_0_item_data.to_dict()
                product_suspension.append(product_suspension_type_0_item)

        else:
            product_suspension = self.product_suspension

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "name": name,
                "service_provider_id": service_provider_id,
                "bidding_zone": bidding_zone,
                "status": status,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
            }
        )
        if additional_information is not UNSET:
            field_dict["additional_information"] = additional_information
        if summary is not UNSET:
            field_dict["summary"] = summary
        if service_provider is not UNSET:
            field_dict["service_provider"] = service_provider
        if membership is not UNSET:
            field_dict["membership"] = membership
        if grid_prequalification is not UNSET:
            field_dict["grid_prequalification"] = grid_prequalification
        if grid_suspension is not UNSET:
            field_dict["grid_suspension"] = grid_suspension
        if product_application is not UNSET:
            field_dict["product_application"] = product_application
        if product_suspension is not UNSET:
            field_dict["product_suspension"] = product_suspension

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.party_response import PartyResponse
        from ..models.service_providing_group_grid_prequalification_response import (
            ServiceProvidingGroupGridPrequalificationResponse,
        )
        from ..models.service_providing_group_grid_suspension_response import (
            ServiceProvidingGroupGridSuspensionResponse,
        )
        from ..models.service_providing_group_membership_response import ServiceProvidingGroupMembershipResponse
        from ..models.service_providing_group_product_application_response import (
            ServiceProvidingGroupProductApplicationResponse,
        )
        from ..models.service_providing_group_product_suspension_response import (
            ServiceProvidingGroupProductSuspensionResponse,
        )
        from ..models.service_providing_group_summary_response import ServiceProvidingGroupSummaryResponse

        d = dict(src_dict)
        id = d.pop("id")

        name = d.pop("name")

        service_provider_id = d.pop("service_provider_id")

        bidding_zone = ServiceProvidingGroupBiddingZone(d.pop("bidding_zone"))

        status = ServiceProvidingGroupStatus(d.pop("status"))

        recorded_at = isoparse(d.pop("recorded_at"))

        recorded_by = d.pop("recorded_by")

        def _parse_additional_information(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        additional_information = _parse_additional_information(d.pop("additional_information", UNSET))

        def _parse_summary(data: object) -> None | ServiceProvidingGroupSummaryResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                summary_type_0 = ServiceProvidingGroupSummaryResponse.from_dict(data)

                return summary_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | ServiceProvidingGroupSummaryResponse | Unset, data)

        summary = _parse_summary(d.pop("summary", UNSET))

        def _parse_service_provider(data: object) -> None | PartyResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                service_provider_type_0 = PartyResponse.from_dict(data)

                return service_provider_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | PartyResponse | Unset, data)

        service_provider = _parse_service_provider(d.pop("service_provider", UNSET))

        def _parse_membership(data: object) -> list[ServiceProvidingGroupMembershipResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                membership_type_0 = []
                _membership_type_0 = data
                for membership_type_0_item_data in _membership_type_0:
                    membership_type_0_item = ServiceProvidingGroupMembershipResponse.from_dict(
                        membership_type_0_item_data
                    )

                    membership_type_0.append(membership_type_0_item)

                return membership_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[ServiceProvidingGroupMembershipResponse] | None | Unset, data)

        membership = _parse_membership(d.pop("membership", UNSET))

        def _parse_grid_prequalification(
            data: object,
        ) -> list[ServiceProvidingGroupGridPrequalificationResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                grid_prequalification_type_0 = []
                _grid_prequalification_type_0 = data
                for grid_prequalification_type_0_item_data in _grid_prequalification_type_0:
                    grid_prequalification_type_0_item = ServiceProvidingGroupGridPrequalificationResponse.from_dict(
                        grid_prequalification_type_0_item_data
                    )

                    grid_prequalification_type_0.append(grid_prequalification_type_0_item)

                return grid_prequalification_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[ServiceProvidingGroupGridPrequalificationResponse] | None | Unset, data)

        grid_prequalification = _parse_grid_prequalification(d.pop("grid_prequalification", UNSET))

        def _parse_grid_suspension(data: object) -> list[ServiceProvidingGroupGridSuspensionResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                grid_suspension_type_0 = []
                _grid_suspension_type_0 = data
                for grid_suspension_type_0_item_data in _grid_suspension_type_0:
                    grid_suspension_type_0_item = ServiceProvidingGroupGridSuspensionResponse.from_dict(
                        grid_suspension_type_0_item_data
                    )

                    grid_suspension_type_0.append(grid_suspension_type_0_item)

                return grid_suspension_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[ServiceProvidingGroupGridSuspensionResponse] | None | Unset, data)

        grid_suspension = _parse_grid_suspension(d.pop("grid_suspension", UNSET))

        def _parse_product_application(
            data: object,
        ) -> list[ServiceProvidingGroupProductApplicationResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                product_application_type_0 = []
                _product_application_type_0 = data
                for product_application_type_0_item_data in _product_application_type_0:
                    product_application_type_0_item = ServiceProvidingGroupProductApplicationResponse.from_dict(
                        product_application_type_0_item_data
                    )

                    product_application_type_0.append(product_application_type_0_item)

                return product_application_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[ServiceProvidingGroupProductApplicationResponse] | None | Unset, data)

        product_application = _parse_product_application(d.pop("product_application", UNSET))

        def _parse_product_suspension(
            data: object,
        ) -> list[ServiceProvidingGroupProductSuspensionResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                product_suspension_type_0 = []
                _product_suspension_type_0 = data
                for product_suspension_type_0_item_data in _product_suspension_type_0:
                    product_suspension_type_0_item = ServiceProvidingGroupProductSuspensionResponse.from_dict(
                        product_suspension_type_0_item_data
                    )

                    product_suspension_type_0.append(product_suspension_type_0_item)

                return product_suspension_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[ServiceProvidingGroupProductSuspensionResponse] | None | Unset, data)

        product_suspension = _parse_product_suspension(d.pop("product_suspension", UNSET))

        service_providing_group_response = cls(
            id=id,
            name=name,
            service_provider_id=service_provider_id,
            bidding_zone=bidding_zone,
            status=status,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            additional_information=additional_information,
            summary=summary,
            service_provider=service_provider,
            membership=membership,
            grid_prequalification=grid_prequalification,
            grid_suspension=grid_suspension,
            product_application=product_application,
            product_suspension=product_suspension,
        )

        service_providing_group_response.additional_properties = d
        return service_providing_group_response

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
