from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_product_application_status import ServiceProvidingGroupProductApplicationStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProvidingGroupProductApplicationUpdateRequest")


@_attrs_define
class ServiceProvidingGroupProductApplicationUpdateRequest:
    """Request schema for update operations - Relation between a service providing group and a system operator for a
    product type, for the SPG to deliver a product to the SO later.

        Attributes:
            status (Union[Unset, ServiceProvidingGroupProductApplicationStatus]): The status of the application. Example:
                in_progress.
            notes (Union[None, Unset, str]): Free text notes on the current product application status.
            last_prequalified (Union[None, Unset, str]): When the product application was last prequalified. Example:
                2022-08-08 12:00:00 CET.
            last_verified (Union[None, Unset, str]): When the product application was last verified. Example: 2021-08-08
                10:00:00 CET.
    """

    status: Union[Unset, ServiceProvidingGroupProductApplicationStatus] = UNSET
    notes: Union[None, Unset, str] = UNSET
    last_prequalified: Union[None, Unset, str] = UNSET
    last_verified: Union[None, Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        status: Union[Unset, str] = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        notes: Union[None, Unset, str]
        if isinstance(self.notes, Unset):
            notes = UNSET
        else:
            notes = self.notes

        last_prequalified: Union[None, Unset, str]
        if isinstance(self.last_prequalified, Unset):
            last_prequalified = UNSET
        else:
            last_prequalified = self.last_prequalified

        last_verified: Union[None, Unset, str]
        if isinstance(self.last_verified, Unset):
            last_verified = UNSET
        else:
            last_verified = self.last_verified

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if status is not UNSET:
            field_dict["status"] = status
        if notes is not UNSET:
            field_dict["notes"] = notes
        if last_prequalified is not UNSET:
            field_dict["last_prequalified"] = last_prequalified
        if last_verified is not UNSET:
            field_dict["last_verified"] = last_verified

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        _status = d.pop("status", UNSET)
        status: Union[Unset, ServiceProvidingGroupProductApplicationStatus]
        if isinstance(_status, Unset):
            status = UNSET
        else:
            status = ServiceProvidingGroupProductApplicationStatus(_status)

        def _parse_notes(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        notes = _parse_notes(d.pop("notes", UNSET))

        def _parse_last_prequalified(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        last_prequalified = _parse_last_prequalified(d.pop("last_prequalified", UNSET))

        def _parse_last_verified(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        last_verified = _parse_last_verified(d.pop("last_verified", UNSET))

        service_providing_group_product_application_update_request = cls(
            status=status,
            notes=notes,
            last_prequalified=last_prequalified,
            last_verified=last_verified,
        )

        service_providing_group_product_application_update_request.additional_properties = d
        return service_providing_group_product_application_update_request

    @property
    def additional_keys(self) -> List[str]:
        return list(self.additional_properties.keys())

    def __getitem__(self, key: str) -> Any:
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: Any) -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties
