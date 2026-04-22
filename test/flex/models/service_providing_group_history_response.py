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


T = TypeVar("T", bound="ServiceProvidingGroupHistoryResponse")


@_attrs_define
class ServiceProvidingGroupHistoryResponse:
    """Service providing group - history

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
        service_providing_group_id (int): Reference to the resource that was updated. Example: 48.
        additional_information (None | str | Unset): Free text field for extra information about the service providing
            group if needed.
        service_provider (None | PartyResponse | Unset): Embedded party
        membership (None | ServiceProvidingGroupMembershipResponse | Unset): Embedded service_providing_group_membership
        grid_prequalification (None | ServiceProvidingGroupGridPrequalificationResponse | Unset): Embedded
            service_providing_group_grid_prequalification
        grid_suspension (None | ServiceProvidingGroupGridSuspensionResponse | Unset): Embedded
            service_providing_group_grid_suspension
        product_application (None | ServiceProvidingGroupProductApplicationResponse | Unset): Embedded
            service_providing_group_product_application
        product_suspension (None | ServiceProvidingGroupProductSuspensionResponse | Unset): Embedded
            service_providing_group_product_suspension
        replaced_by (int | None | Unset): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (datetime.datetime | None | Unset): When the resource was replaced in the system. Example:
            2024-07-07T10:00:00+00:00.
    """

    id: int
    name: str
    service_provider_id: int
    bidding_zone: ServiceProvidingGroupBiddingZone
    status: ServiceProvidingGroupStatus
    recorded_at: datetime.datetime
    recorded_by: int
    service_providing_group_id: int
    additional_information: None | str | Unset = UNSET
    service_provider: None | PartyResponse | Unset = UNSET
    membership: None | ServiceProvidingGroupMembershipResponse | Unset = UNSET
    grid_prequalification: None | ServiceProvidingGroupGridPrequalificationResponse | Unset = UNSET
    grid_suspension: None | ServiceProvidingGroupGridSuspensionResponse | Unset = UNSET
    product_application: None | ServiceProvidingGroupProductApplicationResponse | Unset = UNSET
    product_suspension: None | ServiceProvidingGroupProductSuspensionResponse | Unset = UNSET
    replaced_by: int | None | Unset = UNSET
    replaced_at: datetime.datetime | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
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

        id = self.id

        name = self.name

        service_provider_id = self.service_provider_id

        bidding_zone = self.bidding_zone.value

        status = self.status.value

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        service_providing_group_id = self.service_providing_group_id

        additional_information: None | str | Unset
        if isinstance(self.additional_information, Unset):
            additional_information = UNSET
        else:
            additional_information = self.additional_information

        service_provider: dict[str, Any] | None | Unset
        if isinstance(self.service_provider, Unset):
            service_provider = UNSET
        elif isinstance(self.service_provider, PartyResponse):
            service_provider = self.service_provider.to_dict()
        else:
            service_provider = self.service_provider

        membership: dict[str, Any] | None | Unset
        if isinstance(self.membership, Unset):
            membership = UNSET
        elif isinstance(self.membership, ServiceProvidingGroupMembershipResponse):
            membership = self.membership.to_dict()
        else:
            membership = self.membership

        grid_prequalification: dict[str, Any] | None | Unset
        if isinstance(self.grid_prequalification, Unset):
            grid_prequalification = UNSET
        elif isinstance(self.grid_prequalification, ServiceProvidingGroupGridPrequalificationResponse):
            grid_prequalification = self.grid_prequalification.to_dict()
        else:
            grid_prequalification = self.grid_prequalification

        grid_suspension: dict[str, Any] | None | Unset
        if isinstance(self.grid_suspension, Unset):
            grid_suspension = UNSET
        elif isinstance(self.grid_suspension, ServiceProvidingGroupGridSuspensionResponse):
            grid_suspension = self.grid_suspension.to_dict()
        else:
            grid_suspension = self.grid_suspension

        product_application: dict[str, Any] | None | Unset
        if isinstance(self.product_application, Unset):
            product_application = UNSET
        elif isinstance(self.product_application, ServiceProvidingGroupProductApplicationResponse):
            product_application = self.product_application.to_dict()
        else:
            product_application = self.product_application

        product_suspension: dict[str, Any] | None | Unset
        if isinstance(self.product_suspension, Unset):
            product_suspension = UNSET
        elif isinstance(self.product_suspension, ServiceProvidingGroupProductSuspensionResponse):
            product_suspension = self.product_suspension.to_dict()
        else:
            product_suspension = self.product_suspension

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
                "name": name,
                "service_provider_id": service_provider_id,
                "bidding_zone": bidding_zone,
                "status": status,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
                "service_providing_group_id": service_providing_group_id,
            }
        )
        if additional_information is not UNSET:
            field_dict["additional_information"] = additional_information
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
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at

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

        d = dict(src_dict)
        id = d.pop("id")

        name = d.pop("name")

        service_provider_id = d.pop("service_provider_id")

        bidding_zone = ServiceProvidingGroupBiddingZone(d.pop("bidding_zone"))

        status = ServiceProvidingGroupStatus(d.pop("status"))

        recorded_at = isoparse(d.pop("recorded_at"))

        recorded_by = d.pop("recorded_by")

        service_providing_group_id = d.pop("service_providing_group_id")

        def _parse_additional_information(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        additional_information = _parse_additional_information(d.pop("additional_information", UNSET))

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

        def _parse_membership(data: object) -> None | ServiceProvidingGroupMembershipResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                membership_type_0 = ServiceProvidingGroupMembershipResponse.from_dict(data)

                return membership_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | ServiceProvidingGroupMembershipResponse | Unset, data)

        membership = _parse_membership(d.pop("membership", UNSET))

        def _parse_grid_prequalification(
            data: object,
        ) -> None | ServiceProvidingGroupGridPrequalificationResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                grid_prequalification_type_0 = ServiceProvidingGroupGridPrequalificationResponse.from_dict(data)

                return grid_prequalification_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | ServiceProvidingGroupGridPrequalificationResponse | Unset, data)

        grid_prequalification = _parse_grid_prequalification(d.pop("grid_prequalification", UNSET))

        def _parse_grid_suspension(data: object) -> None | ServiceProvidingGroupGridSuspensionResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                grid_suspension_type_0 = ServiceProvidingGroupGridSuspensionResponse.from_dict(data)

                return grid_suspension_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | ServiceProvidingGroupGridSuspensionResponse | Unset, data)

        grid_suspension = _parse_grid_suspension(d.pop("grid_suspension", UNSET))

        def _parse_product_application(data: object) -> None | ServiceProvidingGroupProductApplicationResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                product_application_type_0 = ServiceProvidingGroupProductApplicationResponse.from_dict(data)

                return product_application_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | ServiceProvidingGroupProductApplicationResponse | Unset, data)

        product_application = _parse_product_application(d.pop("product_application", UNSET))

        def _parse_product_suspension(data: object) -> None | ServiceProvidingGroupProductSuspensionResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                product_suspension_type_0 = ServiceProvidingGroupProductSuspensionResponse.from_dict(data)

                return product_suspension_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | ServiceProvidingGroupProductSuspensionResponse | Unset, data)

        product_suspension = _parse_product_suspension(d.pop("product_suspension", UNSET))

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

        service_providing_group_history_response = cls(
            id=id,
            name=name,
            service_provider_id=service_provider_id,
            bidding_zone=bidding_zone,
            status=status,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            service_providing_group_id=service_providing_group_id,
            additional_information=additional_information,
            service_provider=service_provider,
            membership=membership,
            grid_prequalification=grid_prequalification,
            grid_suspension=grid_suspension,
            product_application=product_application,
            product_suspension=product_suspension,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
        )

        service_providing_group_history_response.additional_properties = d
        return service_providing_group_history_response

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
