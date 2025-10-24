from collections.abc import Mapping
from typing import Any, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_provider_product_application_status import ServiceProviderProductApplicationStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProviderProductApplicationHistoryResponse")


@_attrs_define
class ServiceProviderProductApplicationHistoryResponse:
    """Service Provider Product Application - history

    Attributes:
        service_provider_product_application_id (int): Reference to the resource that was updated. Example: 48.
        product_type_ids (Union[Unset, list[int]]): References to the product types. Example: [2, 4, 5].
        status (Union[Unset, ServiceProviderProductApplicationStatus]): The status of the application. Example:
            in_progress.
        notes (Union[None, Unset, str]): Free text notes on the current product application status.
        qualified_at (Union[None, Unset, str]): When the product application was last validated. Example: 2022-08-08
            12:00:00 CET.
        service_provider_id (Union[Unset, int]): Reference to the service provider. Example: 18.
        system_operator_id (Union[Unset, int]): Reference to the system operator. Example: 39.
        recorded_at (Union[Unset, str]): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31 23:59:00 CET.
        recorded_by (Union[Unset, int]): The identity that recorded the resource. Example: 145.
        id (Union[Unset, int]): Unique surrogate identifier. Example: 89.
        replaced_by (Union[None, Unset, int]): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (Union[None, Unset, str]): When the resource was replaced in the system. Example: 2024-07-07
            10:00:00 CET.
    """

    service_provider_product_application_id: int
    product_type_ids: Union[Unset, list[int]] = UNSET
    status: Union[Unset, ServiceProviderProductApplicationStatus] = UNSET
    notes: Union[None, Unset, str] = UNSET
    qualified_at: Union[None, Unset, str] = UNSET
    service_provider_id: Union[Unset, int] = UNSET
    system_operator_id: Union[Unset, int] = UNSET
    recorded_at: Union[Unset, str] = UNSET
    recorded_by: Union[Unset, int] = UNSET
    id: Union[Unset, int] = UNSET
    replaced_by: Union[None, Unset, int] = UNSET
    replaced_at: Union[None, Unset, str] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        service_provider_product_application_id = self.service_provider_product_application_id

        product_type_ids: Union[Unset, list[int]] = UNSET
        if not isinstance(self.product_type_ids, Unset):
            product_type_ids = self.product_type_ids

        status: Union[Unset, str] = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        notes: Union[None, Unset, str]
        if isinstance(self.notes, Unset):
            notes = UNSET
        else:
            notes = self.notes

        qualified_at: Union[None, Unset, str]
        if isinstance(self.qualified_at, Unset):
            qualified_at = UNSET
        else:
            qualified_at = self.qualified_at

        service_provider_id = self.service_provider_id

        system_operator_id = self.system_operator_id

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        id = self.id

        replaced_by: Union[None, Unset, int]
        if isinstance(self.replaced_by, Unset):
            replaced_by = UNSET
        else:
            replaced_by = self.replaced_by

        replaced_at: Union[None, Unset, str]
        if isinstance(self.replaced_at, Unset):
            replaced_at = UNSET
        else:
            replaced_at = self.replaced_at

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "service_provider_product_application_id": service_provider_product_application_id,
            }
        )
        if product_type_ids is not UNSET:
            field_dict["product_type_ids"] = product_type_ids
        if status is not UNSET:
            field_dict["status"] = status
        if notes is not UNSET:
            field_dict["notes"] = notes
        if qualified_at is not UNSET:
            field_dict["qualified_at"] = qualified_at
        if service_provider_id is not UNSET:
            field_dict["service_provider_id"] = service_provider_id
        if system_operator_id is not UNSET:
            field_dict["system_operator_id"] = system_operator_id
        if recorded_at is not UNSET:
            field_dict["recorded_at"] = recorded_at
        if recorded_by is not UNSET:
            field_dict["recorded_by"] = recorded_by
        if id is not UNSET:
            field_dict["id"] = id
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        service_provider_product_application_id = d.pop("service_provider_product_application_id")

        product_type_ids = cast(list[int], d.pop("product_type_ids", UNSET))

        _status = d.pop("status", UNSET)
        status: Union[Unset, ServiceProviderProductApplicationStatus]
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = ServiceProviderProductApplicationStatus(_status)

        def _parse_notes(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        notes = _parse_notes(d.pop("notes", UNSET))

        def _parse_qualified_at(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        qualified_at = _parse_qualified_at(d.pop("qualified_at", UNSET))

        service_provider_id = d.pop("service_provider_id", UNSET)

        system_operator_id = d.pop("system_operator_id", UNSET)

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        id = d.pop("id", UNSET)

        def _parse_replaced_by(data: object) -> Union[None, Unset, int]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, int], data)

        replaced_by = _parse_replaced_by(d.pop("replaced_by", UNSET))

        def _parse_replaced_at(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        replaced_at = _parse_replaced_at(d.pop("replaced_at", UNSET))

        service_provider_product_application_history_response = cls(
            service_provider_product_application_id=service_provider_product_application_id,
            product_type_ids=product_type_ids,
            status=status,
            notes=notes,
            qualified_at=qualified_at,
            service_provider_id=service_provider_id,
            system_operator_id=system_operator_id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            id=id,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
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
