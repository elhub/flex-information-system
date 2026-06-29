from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_product_application_ramping_capability import (
    ServiceProvidingGroupProductApplicationRampingCapability,
)
from ..models.service_providing_group_product_application_status import ServiceProvidingGroupProductApplicationStatus
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.party_response import PartyResponse
    from ..models.service_providing_group_product_application_comment_response import (
        ServiceProvidingGroupProductApplicationCommentResponse,
    )
    from ..models.service_providing_group_response import ServiceProvidingGroupResponse


T = TypeVar("T", bound="ServiceProvidingGroupProductApplicationResponse")


@_attrs_define
class ServiceProvidingGroupProductApplicationResponse:
    """Response schema - Relation between a service providing group and a system operator for a product type, for the SPG
    to deliver a product to the SO later.

        Attributes:
            id (int): Unique surrogate identifier. Example: 89.
            service_providing_group_id (int): Reference to the service providing group. Example: 18.
            procuring_system_operator_id (int): Reference to the procuring system operator. Example: 39.
            product_type_ids (list[int]): References to the product types. Example: [2, 4, 5].
            status (ServiceProvidingGroupProductApplicationStatus): The status of the application. Example:
                prequalification.
            maximum_active_power_up (float): The maximum active power applied for in regulation direction up. Stored in
                kilowatts. Example: 150.5.
            maximum_active_power_down (float): The maximum active power applied for in regulation direction down. Stored in
                kilowatts. Example: 150.5.
            recorded_at (datetime.datetime): When the resource was recorded (created or updated) in the system. Example:
                2023-12-31T23:59:00+00:00.
            recorded_by (int): The identity that recorded the resource. Example: 145.
            additional_information (None | str | Unset): Free text field for extra information about the application if
                needed (bidding periods, unavailabilities, etc).
            prequalified_at (datetime.datetime | None | Unset): When the product application was last prequalified. Example:
                2022-08-08T12:00:00+02.
            verified_at (datetime.datetime | None | Unset): When the product application was last verified. Example:
                2021-08-08T10:00:00+02.
            ramping_capability (None | ServiceProvidingGroupProductApplicationRampingCapability | Unset):
            ramping_description (None | str | Unset): Free text description of ramping details. Only required for product
                Manual Congestion. Example: Units are (dis)connected one by one to achieve a stepwise profile. We ensure
                linearity on a minute resolution..
            service_providing_group (None | ServiceProvidingGroupResponse | Unset): Embedded service_providing_group
            procuring_system_operator (None | PartyResponse | Unset): Embedded party
            comment (list[ServiceProvidingGroupProductApplicationCommentResponse] | None | Unset): Embedded
                service_providing_group_product_application_comment
    """

    id: int
    service_providing_group_id: int
    procuring_system_operator_id: int
    product_type_ids: list[int]
    status: ServiceProvidingGroupProductApplicationStatus
    maximum_active_power_up: float
    maximum_active_power_down: float
    recorded_at: datetime.datetime
    recorded_by: int
    additional_information: None | str | Unset = UNSET
    prequalified_at: datetime.datetime | None | Unset = UNSET
    verified_at: datetime.datetime | None | Unset = UNSET
    ramping_capability: None | ServiceProvidingGroupProductApplicationRampingCapability | Unset = UNSET
    ramping_description: None | str | Unset = UNSET
    service_providing_group: None | ServiceProvidingGroupResponse | Unset = UNSET
    procuring_system_operator: None | PartyResponse | Unset = UNSET
    comment: list[ServiceProvidingGroupProductApplicationCommentResponse] | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.party_response import PartyResponse
        from ..models.service_providing_group_response import ServiceProvidingGroupResponse

        id = self.id

        service_providing_group_id = self.service_providing_group_id

        procuring_system_operator_id = self.procuring_system_operator_id

        product_type_ids = self.product_type_ids

        status = self.status.value

        maximum_active_power_up = self.maximum_active_power_up

        maximum_active_power_down = self.maximum_active_power_down

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        additional_information: None | str | Unset
        if isinstance(self.additional_information, Unset):
            additional_information = UNSET
        else:
            additional_information = self.additional_information

        prequalified_at: None | str | Unset
        if isinstance(self.prequalified_at, Unset):
            prequalified_at = UNSET
        elif isinstance(self.prequalified_at, datetime.datetime):
            prequalified_at = self.prequalified_at.isoformat()
        else:
            prequalified_at = self.prequalified_at

        verified_at: None | str | Unset
        if isinstance(self.verified_at, Unset):
            verified_at = UNSET
        elif isinstance(self.verified_at, datetime.datetime):
            verified_at = self.verified_at.isoformat()
        else:
            verified_at = self.verified_at

        ramping_capability: None | str | Unset
        if isinstance(self.ramping_capability, Unset):
            ramping_capability = UNSET
        elif isinstance(self.ramping_capability, ServiceProvidingGroupProductApplicationRampingCapability):
            ramping_capability = self.ramping_capability.value
        else:
            ramping_capability = self.ramping_capability

        ramping_description: None | str | Unset
        if isinstance(self.ramping_description, Unset):
            ramping_description = UNSET
        else:
            ramping_description = self.ramping_description

        service_providing_group: dict[str, Any] | None | Unset
        if isinstance(self.service_providing_group, Unset):
            service_providing_group = UNSET
        elif isinstance(self.service_providing_group, ServiceProvidingGroupResponse):
            service_providing_group = self.service_providing_group.to_dict()
        else:
            service_providing_group = self.service_providing_group

        procuring_system_operator: dict[str, Any] | None | Unset
        if isinstance(self.procuring_system_operator, Unset):
            procuring_system_operator = UNSET
        elif isinstance(self.procuring_system_operator, PartyResponse):
            procuring_system_operator = self.procuring_system_operator.to_dict()
        else:
            procuring_system_operator = self.procuring_system_operator

        comment: list[dict[str, Any]] | None | Unset
        if isinstance(self.comment, Unset):
            comment = UNSET
        elif isinstance(self.comment, list):
            comment = []
            for comment_type_0_item_data in self.comment:
                comment_type_0_item = comment_type_0_item_data.to_dict()
                comment.append(comment_type_0_item)

        else:
            comment = self.comment

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "service_providing_group_id": service_providing_group_id,
                "procuring_system_operator_id": procuring_system_operator_id,
                "product_type_ids": product_type_ids,
                "status": status,
                "maximum_active_power_up": maximum_active_power_up,
                "maximum_active_power_down": maximum_active_power_down,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
            }
        )
        if additional_information is not UNSET:
            field_dict["additional_information"] = additional_information
        if prequalified_at is not UNSET:
            field_dict["prequalified_at"] = prequalified_at
        if verified_at is not UNSET:
            field_dict["verified_at"] = verified_at
        if ramping_capability is not UNSET:
            field_dict["ramping_capability"] = ramping_capability
        if ramping_description is not UNSET:
            field_dict["ramping_description"] = ramping_description
        if service_providing_group is not UNSET:
            field_dict["service_providing_group"] = service_providing_group
        if procuring_system_operator is not UNSET:
            field_dict["procuring_system_operator"] = procuring_system_operator
        if comment is not UNSET:
            field_dict["comment"] = comment

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.party_response import PartyResponse
        from ..models.service_providing_group_product_application_comment_response import (
            ServiceProvidingGroupProductApplicationCommentResponse,
        )
        from ..models.service_providing_group_response import ServiceProvidingGroupResponse

        d = dict(src_dict)
        id = d.pop("id")

        service_providing_group_id = d.pop("service_providing_group_id")

        procuring_system_operator_id = d.pop("procuring_system_operator_id")

        product_type_ids = cast(list[int], d.pop("product_type_ids"))

        status = ServiceProvidingGroupProductApplicationStatus(d.pop("status"))

        maximum_active_power_up = d.pop("maximum_active_power_up")

        maximum_active_power_down = d.pop("maximum_active_power_down")

        recorded_at = datetime.datetime.fromisoformat(d.pop("recorded_at"))

        recorded_by = d.pop("recorded_by")

        def _parse_additional_information(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        additional_information = _parse_additional_information(d.pop("additional_information", UNSET))

        def _parse_prequalified_at(data: object) -> datetime.datetime | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                prequalified_at_type_0 = datetime.datetime.fromisoformat(data)

                return prequalified_at_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.datetime | None | Unset, data)

        prequalified_at = _parse_prequalified_at(d.pop("prequalified_at", UNSET))

        def _parse_verified_at(data: object) -> datetime.datetime | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                verified_at_type_0 = datetime.datetime.fromisoformat(data)

                return verified_at_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.datetime | None | Unset, data)

        verified_at = _parse_verified_at(d.pop("verified_at", UNSET))

        def _parse_ramping_capability(
            data: object,
        ) -> None | ServiceProvidingGroupProductApplicationRampingCapability | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                ramping_capability_type_0 = ServiceProvidingGroupProductApplicationRampingCapability(data)

                return ramping_capability_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | ServiceProvidingGroupProductApplicationRampingCapability | Unset, data)

        ramping_capability = _parse_ramping_capability(d.pop("ramping_capability", UNSET))

        def _parse_ramping_description(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        ramping_description = _parse_ramping_description(d.pop("ramping_description", UNSET))

        def _parse_service_providing_group(data: object) -> None | ServiceProvidingGroupResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                service_providing_group_type_0 = ServiceProvidingGroupResponse.from_dict(data)

                return service_providing_group_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | ServiceProvidingGroupResponse | Unset, data)

        service_providing_group = _parse_service_providing_group(d.pop("service_providing_group", UNSET))

        def _parse_procuring_system_operator(data: object) -> None | PartyResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                procuring_system_operator_type_0 = PartyResponse.from_dict(data)

                return procuring_system_operator_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | PartyResponse | Unset, data)

        procuring_system_operator = _parse_procuring_system_operator(d.pop("procuring_system_operator", UNSET))

        def _parse_comment(data: object) -> list[ServiceProvidingGroupProductApplicationCommentResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                comment_type_0 = []
                _comment_type_0 = data
                for comment_type_0_item_data in _comment_type_0:
                    comment_type_0_item = ServiceProvidingGroupProductApplicationCommentResponse.from_dict(
                        comment_type_0_item_data
                    )

                    comment_type_0.append(comment_type_0_item)

                return comment_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[ServiceProvidingGroupProductApplicationCommentResponse] | None | Unset, data)

        comment = _parse_comment(d.pop("comment", UNSET))

        service_providing_group_product_application_response = cls(
            id=id,
            service_providing_group_id=service_providing_group_id,
            procuring_system_operator_id=procuring_system_operator_id,
            product_type_ids=product_type_ids,
            status=status,
            maximum_active_power_up=maximum_active_power_up,
            maximum_active_power_down=maximum_active_power_down,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            additional_information=additional_information,
            prequalified_at=prequalified_at,
            verified_at=verified_at,
            ramping_capability=ramping_capability,
            ramping_description=ramping_description,
            service_providing_group=service_providing_group,
            procuring_system_operator=procuring_system_operator,
            comment=comment,
        )

        service_providing_group_product_application_response.additional_properties = d
        return service_providing_group_product_application_response

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
