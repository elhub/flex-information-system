from collections.abc import Mapping
from typing import Any, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_provider_product_application_status import ServiceProviderProductApplicationStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProviderProductApplicationUpdateRequest")


@_attrs_define
class ServiceProviderProductApplicationUpdateRequest:
    """Request schema for update operations - Relation between a service provider and a system operator, for the SP to
    apply for delivering the SO some of the types of product they want to buy on a flexibility market.

        Attributes:
            product_type_ids (Union[Unset, list[int]]): References to the product types. Example: [2, 4, 5].
            status (Union[Unset, ServiceProviderProductApplicationStatus]): The status of the application. Example:
                in_progress.
            notes (Union[None, Unset, str]): Free text notes on the current product application status.
            qualified_at (Union[None, Unset, str]): When the product application was last validated. Example: 2022-08-08
                12:00:00 CET.
    """

    product_type_ids: Union[Unset, list[int]] = UNSET
    status: Union[Unset, ServiceProviderProductApplicationStatus] = UNSET
    notes: Union[None, Unset, str] = UNSET
    qualified_at: Union[None, Unset, str] = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
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

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if product_type_ids is not UNSET:
            field_dict["product_type_ids"] = product_type_ids
        if status is not UNSET:
            field_dict["status"] = status
        if notes is not UNSET:
            field_dict["notes"] = notes
        if qualified_at is not UNSET:
            field_dict["qualified_at"] = qualified_at

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
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

        service_provider_product_application_update_request = cls(
            product_type_ids=product_type_ids,
            status=status,
            notes=notes,
            qualified_at=qualified_at,
        )

        service_provider_product_application_update_request.additional_properties = d
        return service_provider_product_application_update_request

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
