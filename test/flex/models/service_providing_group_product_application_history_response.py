from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_product_application_status import ServiceProvidingGroupProductApplicationStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProvidingGroupProductApplicationHistoryResponse")


@_attrs_define
class ServiceProvidingGroupProductApplicationHistoryResponse:
    """Service Providing Group Product Application - history

    Attributes:
        service_providing_group_product_application_id (int): Reference to the resource that was updated. Example: 48.
        status (Union[Unset, ServiceProvidingGroupProductApplicationStatus]): The status of the application. Example:
            in_progress.
        notes (Union[None, Unset, str]): Free text notes on the current product application status.
        prequalified_at (Union[None, Unset, str]): When the product application was last prequalified. Example:
            2022-08-08 12:00:00 CET.
        verified_at (Union[None, Unset, str]): When the product application was last verified. Example: 2021-08-08
            10:00:00 CET.
        service_providing_group_id (Union[Unset, int]): Reference to the service providing group. Example: 18.
        procuring_system_operator_id (Union[Unset, int]): Reference to the procuring system operator. Example: 39.
        product_type_id (Union[Unset, int]): References to the product type. Example: 2.
        recorded_at (Union[Unset, str]): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31 23:59:00 CET.
        recorded_by (Union[Unset, int]): The identity that recorded the resource. Example: 145.
        id (Union[Unset, int]): Unique surrogate identifier. Example: 89.
        replaced_by (Union[None, Unset, int]): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (Union[None, Unset, str]): When the resource was replaced in the system. Example: 2024-07-07
            10:00:00 CET.
    """

    service_providing_group_product_application_id: int
    status: Union[Unset, ServiceProvidingGroupProductApplicationStatus] = UNSET
    notes: Union[None, Unset, str] = UNSET
    prequalified_at: Union[None, Unset, str] = UNSET
    verified_at: Union[None, Unset, str] = UNSET
    service_providing_group_id: Union[Unset, int] = UNSET
    procuring_system_operator_id: Union[Unset, int] = UNSET
    product_type_id: Union[Unset, int] = UNSET
    recorded_at: Union[Unset, str] = UNSET
    recorded_by: Union[Unset, int] = UNSET
    id: Union[Unset, int] = UNSET
    replaced_by: Union[None, Unset, int] = UNSET
    replaced_at: Union[None, Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        service_providing_group_product_application_id = self.service_providing_group_product_application_id

        status: Union[Unset, str] = UNSET
        if not isinstance(self.status, Unset):
            status = self.status.value

        notes: Union[None, Unset, str]
        if isinstance(self.notes, Unset):
            notes = UNSET
        else:
            notes = self.notes

        prequalified_at: Union[None, Unset, str]
        if isinstance(self.prequalified_at, Unset):
            prequalified_at = UNSET
        else:
            prequalified_at = self.prequalified_at

        verified_at: Union[None, Unset, str]
        if isinstance(self.verified_at, Unset):
            verified_at = UNSET
        else:
            verified_at = self.verified_at

        service_providing_group_id = self.service_providing_group_id

        procuring_system_operator_id = self.procuring_system_operator_id

        product_type_id = self.product_type_id

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

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "service_providing_group_product_application_id": service_providing_group_product_application_id,
            }
        )
        if status is not UNSET:
            field_dict["status"] = status
        if notes is not UNSET:
            field_dict["notes"] = notes
        if prequalified_at is not UNSET:
            field_dict["prequalified_at"] = prequalified_at
        if verified_at is not UNSET:
            field_dict["verified_at"] = verified_at
        if service_providing_group_id is not UNSET:
            field_dict["service_providing_group_id"] = service_providing_group_id
        if procuring_system_operator_id is not UNSET:
            field_dict["procuring_system_operator_id"] = procuring_system_operator_id
        if product_type_id is not UNSET:
            field_dict["product_type_id"] = product_type_id
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
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        service_providing_group_product_application_id = d.pop("service_providing_group_product_application_id")

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

        def _parse_prequalified_at(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        prequalified_at = _parse_prequalified_at(d.pop("prequalified_at", UNSET))

        def _parse_verified_at(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        verified_at = _parse_verified_at(d.pop("verified_at", UNSET))

        service_providing_group_id = d.pop("service_providing_group_id", UNSET)

        procuring_system_operator_id = d.pop("procuring_system_operator_id", UNSET)

        product_type_id = d.pop("product_type_id", UNSET)

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

        service_providing_group_product_application_history_response = cls(
            service_providing_group_product_application_id=service_providing_group_product_application_id,
            status=status,
            notes=notes,
            prequalified_at=prequalified_at,
            verified_at=verified_at,
            service_providing_group_id=service_providing_group_id,
            procuring_system_operator_id=procuring_system_operator_id,
            product_type_id=product_type_id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            id=id,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
        )

        service_providing_group_product_application_history_response.additional_properties = d
        return service_providing_group_product_application_history_response

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
