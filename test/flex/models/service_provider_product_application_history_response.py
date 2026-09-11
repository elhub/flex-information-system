from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_provider_product_application_status import ServiceProviderProductApplicationStatus
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.party_history_response import PartyHistoryResponse
    from ..models.service_provider_product_application_comment_history_response import (
        ServiceProviderProductApplicationCommentHistoryResponse,
    )


T = TypeVar("T", bound="ServiceProviderProductApplicationHistoryResponse")


@_attrs_define
class ServiceProviderProductApplicationHistoryResponse:
    """Service Provider Product Application - history

    Attributes:
        id (int): Unique surrogate identifier. Example: 89.
        service_provider_id (int): Reference to the service provider. Example: 18.
        system_operator_id (int): Reference to the system operator. Example: 39.
        product_type_ids (list[int]): References to the product types. Example: [2, 4, 5].
        status (ServiceProviderProductApplicationStatus): The status of the application. Example: in_progress.
        recorded_at (datetime.datetime): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31T23:59:00+00:00.
        recorded_by (int): The identity that recorded the resource. Example: 145.
        service_provider_product_application_id (int): Reference to the resource that was updated. Example: 48.
        qualified_at (datetime.datetime | None | Unset): When the product application was last validated. Example:
            2022-08-08T12:00:00+02.
        replaced_by (int | None | Unset): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (datetime.datetime | None | Unset): When the resource was replaced in the system. Example:
            2024-07-07T10:00:00+00:00.
        service_provider_history (list[PartyHistoryResponse] | None | Unset): Embedded party_history
        system_operator_history (list[PartyHistoryResponse] | None | Unset): Embedded party_history
        comment_history (list[ServiceProviderProductApplicationCommentHistoryResponse] | None | Unset): Embedded
            service_provider_product_application_comment_history
    """

    id: int
    service_provider_id: int
    system_operator_id: int
    product_type_ids: list[int]
    status: ServiceProviderProductApplicationStatus
    recorded_at: datetime.datetime
    recorded_by: int
    service_provider_product_application_id: int
    qualified_at: datetime.datetime | None | Unset = UNSET
    replaced_by: int | None | Unset = UNSET
    replaced_at: datetime.datetime | None | Unset = UNSET
    service_provider_history: list[PartyHistoryResponse] | None | Unset = UNSET
    system_operator_history: list[PartyHistoryResponse] | None | Unset = UNSET
    comment_history: list[ServiceProviderProductApplicationCommentHistoryResponse] | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        service_provider_id = self.service_provider_id

        system_operator_id = self.system_operator_id

        product_type_ids = self.product_type_ids

        status = self.status.value

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        service_provider_product_application_id = self.service_provider_product_application_id

        qualified_at: None | str | Unset
        if isinstance(self.qualified_at, Unset):
            qualified_at = UNSET
        elif isinstance(self.qualified_at, datetime.datetime):
            qualified_at = self.qualified_at.isoformat()
        else:
            qualified_at = self.qualified_at

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

        system_operator_history: list[dict[str, Any]] | None | Unset
        if isinstance(self.system_operator_history, Unset):
            system_operator_history = UNSET
        elif isinstance(self.system_operator_history, list):
            system_operator_history = []
            for system_operator_history_type_0_item_data in self.system_operator_history:
                system_operator_history_type_0_item = system_operator_history_type_0_item_data.to_dict()
                system_operator_history.append(system_operator_history_type_0_item)

        else:
            system_operator_history = self.system_operator_history

        comment_history: list[dict[str, Any]] | None | Unset
        if isinstance(self.comment_history, Unset):
            comment_history = UNSET
        elif isinstance(self.comment_history, list):
            comment_history = []
            for comment_history_type_0_item_data in self.comment_history:
                comment_history_type_0_item = comment_history_type_0_item_data.to_dict()
                comment_history.append(comment_history_type_0_item)

        else:
            comment_history = self.comment_history

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "service_provider_id": service_provider_id,
                "system_operator_id": system_operator_id,
                "product_type_ids": product_type_ids,
                "status": status,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
                "service_provider_product_application_id": service_provider_product_application_id,
            }
        )
        if qualified_at is not UNSET:
            field_dict["qualified_at"] = qualified_at
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at
        if service_provider_history is not UNSET:
            field_dict["service_provider_history"] = service_provider_history
        if system_operator_history is not UNSET:
            field_dict["system_operator_history"] = system_operator_history
        if comment_history is not UNSET:
            field_dict["comment_history"] = comment_history

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.party_history_response import PartyHistoryResponse
        from ..models.service_provider_product_application_comment_history_response import (
            ServiceProviderProductApplicationCommentHistoryResponse,
        )

        d = dict(src_dict)
        id = d.pop("id")

        service_provider_id = d.pop("service_provider_id")

        system_operator_id = d.pop("system_operator_id")

        product_type_ids = cast(list[int], d.pop("product_type_ids"))

        status = ServiceProviderProductApplicationStatus(d.pop("status"))

        recorded_at = datetime.datetime.fromisoformat(d.pop("recorded_at"))

        recorded_by = d.pop("recorded_by")

        service_provider_product_application_id = d.pop("service_provider_product_application_id")

        def _parse_qualified_at(data: object) -> datetime.datetime | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                qualified_at_type_0 = datetime.datetime.fromisoformat(data)

                return qualified_at_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(datetime.datetime | None | Unset, data)

        qualified_at = _parse_qualified_at(d.pop("qualified_at", UNSET))

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

        def _parse_service_provider_history(data: object) -> list[PartyHistoryResponse] | None | Unset:
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
                    service_provider_history_type_0_item = PartyHistoryResponse.from_dict(
                        service_provider_history_type_0_item_data
                    )

                    service_provider_history_type_0.append(service_provider_history_type_0_item)

                return service_provider_history_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[PartyHistoryResponse] | None | Unset, data)

        service_provider_history = _parse_service_provider_history(d.pop("service_provider_history", UNSET))

        def _parse_system_operator_history(data: object) -> list[PartyHistoryResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                system_operator_history_type_0 = []
                _system_operator_history_type_0 = data
                for system_operator_history_type_0_item_data in _system_operator_history_type_0:
                    system_operator_history_type_0_item = PartyHistoryResponse.from_dict(
                        system_operator_history_type_0_item_data
                    )

                    system_operator_history_type_0.append(system_operator_history_type_0_item)

                return system_operator_history_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[PartyHistoryResponse] | None | Unset, data)

        system_operator_history = _parse_system_operator_history(d.pop("system_operator_history", UNSET))

        def _parse_comment_history(
            data: object,
        ) -> list[ServiceProviderProductApplicationCommentHistoryResponse] | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                comment_history_type_0 = []
                _comment_history_type_0 = data
                for comment_history_type_0_item_data in _comment_history_type_0:
                    comment_history_type_0_item = ServiceProviderProductApplicationCommentHistoryResponse.from_dict(
                        comment_history_type_0_item_data
                    )

                    comment_history_type_0.append(comment_history_type_0_item)

                return comment_history_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(list[ServiceProviderProductApplicationCommentHistoryResponse] | None | Unset, data)

        comment_history = _parse_comment_history(d.pop("comment_history", UNSET))

        service_provider_product_application_history_response = cls(
            id=id,
            service_provider_id=service_provider_id,
            system_operator_id=system_operator_id,
            product_type_ids=product_type_ids,
            status=status,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            service_provider_product_application_id=service_provider_product_application_id,
            qualified_at=qualified_at,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
            service_provider_history=service_provider_history,
            system_operator_history=system_operator_history,
            comment_history=comment_history,
        )

        service_provider_product_application_history_response.additional_properties = d
        return service_provider_product_application_history_response

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
