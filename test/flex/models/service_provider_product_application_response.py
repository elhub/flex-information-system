from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_provider_product_application_status import ServiceProviderProductApplicationStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProviderProductApplicationResponse")


@_attrs_define
class ServiceProviderProductApplicationResponse:
    """Response schema for operations with return values - Relation between a service provider and a system operator, for
    the SP to apply for delivering the SO some of the types of product they want to buy on a flexibility market.

        Attributes:
            service_provider_id (int): Reference to the service provider. Example: 18.
            system_operator_id (int): Reference to the system operator. Example: 39.
            product_type_ids (Union[Unset, List[int]]): References to the product types. Example: [2, 4, 5].
            status (Union[Unset, ServiceProviderProductApplicationStatus]): The status of the application. Example:
                in_progress.
            notes (Union[None, Unset, str]): Free text notes on the current product application status.
            last_qualified (Union[None, Unset, str]): When the product application was last validated. Example: 2022-08-08
                12:00:00 CET.
            id (Union[Unset, int]): Unique surrogate identifier. Example: 89.
            recorded_at (Union[Unset, str]): When the resource was recorded (created or updated) in the system. Example:
                2023-12-31 23:59:00 CET.
            recorded_by (Union[Unset, int]): The identity that recorded the resource. Example: 145.
    """

    service_provider_id: int
    system_operator_id: int
    product_type_ids: Union[Unset, List[int]] = UNSET
    status: Union[Unset, ServiceProviderProductApplicationStatus] = UNSET
    notes: Union[None, Unset, str] = UNSET
    last_qualified: Union[None, Unset, str] = UNSET
    id: Union[Unset, int] = UNSET
    recorded_at: Union[Unset, str] = UNSET
    recorded_by: Union[Unset, int] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        service_provider_id = self.service_provider_id

        system_operator_id = self.system_operator_id

        product_type_ids: Union[Unset, List[int]] = UNSET
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

        last_qualified: Union[None, Unset, str]
        if isinstance(self.last_qualified, Unset):
            last_qualified = UNSET
        else:
            last_qualified = self.last_qualified

        id = self.id

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "service_provider_id": service_provider_id,
                "system_operator_id": system_operator_id,
            }
        )
        if product_type_ids is not UNSET:
            field_dict["product_type_ids"] = product_type_ids
        if status is not UNSET:
            field_dict["status"] = status
        if notes is not UNSET:
            field_dict["notes"] = notes
        if last_qualified is not UNSET:
            field_dict["last_qualified"] = last_qualified
        if id is not UNSET:
            field_dict["id"] = id
        if recorded_at is not UNSET:
            field_dict["recorded_at"] = recorded_at
        if recorded_by is not UNSET:
            field_dict["recorded_by"] = recorded_by

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        service_provider_id = d.pop("service_provider_id")

        system_operator_id = d.pop("system_operator_id")

        product_type_ids = cast(List[int], d.pop("product_type_ids", UNSET))

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

        def _parse_last_qualified(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        last_qualified = _parse_last_qualified(d.pop("last_qualified", UNSET))

        id = d.pop("id", UNSET)

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        service_provider_product_application_response = cls(
            service_provider_id=service_provider_id,
            system_operator_id=system_operator_id,
            product_type_ids=product_type_ids,
            status=status,
            notes=notes,
            last_qualified=last_qualified,
            id=id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
        )

        service_provider_product_application_response.additional_properties = d
        return service_provider_product_application_response

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
