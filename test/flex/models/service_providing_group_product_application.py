from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_product_application_status import ServiceProvidingGroupProductApplicationStatus
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProvidingGroupProductApplication")


@_attrs_define
class ServiceProvidingGroupProductApplication:
    """Data schema - Relation between a service providing group and a system operator for a product type, for the SPG to
    deliver a product to the SO later.

        Attributes:
            recorded_at (str): When the resource was recorded (created or updated) in the system. Example: 2023-12-31
                23:59:00 CET.
            recorded_by (int): The identity that recorded the resource. Example: 145.
            status (Union[Unset, ServiceProvidingGroupProductApplicationStatus]): The status of the application. Example:
                in_progress.
            notes (Union[None, Unset, str]): Free text notes on the current product application status.
            last_prequalified (Union[None, Unset, str]): When the product application was last prequalified. Example:
                2022-08-08 12:00:00 CET.
            last_verified (Union[None, Unset, str]): When the product application was last verified. Example: 2021-08-08
                10:00:00 CET.
            service_providing_group_id (Union[Unset, int]): Reference to the service providing group. Example: 18.
            procuring_system_operator_id (Union[Unset, int]): Reference to the procuring system operator. Example: 39.
            product_type_id (Union[Unset, int]): References to the product type. Example: 2.
            id (Union[Unset, int]): Unique surrogate identifier. Example: 89.
    """

    recorded_at: str
    recorded_by: int
    status: Union[Unset, ServiceProvidingGroupProductApplicationStatus] = UNSET
    notes: Union[None, Unset, str] = UNSET
    last_prequalified: Union[None, Unset, str] = UNSET
    last_verified: Union[None, Unset, str] = UNSET
    service_providing_group_id: Union[Unset, int] = UNSET
    procuring_system_operator_id: Union[Unset, int] = UNSET
    product_type_id: Union[Unset, int] = UNSET
    id: Union[Unset, int] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

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

        service_providing_group_id = self.service_providing_group_id

        procuring_system_operator_id = self.procuring_system_operator_id

        product_type_id = self.product_type_id

        id = self.id

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
            }
        )
        if status is not UNSET:
            field_dict["status"] = status
        if notes is not UNSET:
            field_dict["notes"] = notes
        if last_prequalified is not UNSET:
            field_dict["last_prequalified"] = last_prequalified
        if last_verified is not UNSET:
            field_dict["last_verified"] = last_verified
        if service_providing_group_id is not UNSET:
            field_dict["service_providing_group_id"] = service_providing_group_id
        if procuring_system_operator_id is not UNSET:
            field_dict["procuring_system_operator_id"] = procuring_system_operator_id
        if product_type_id is not UNSET:
            field_dict["product_type_id"] = product_type_id
        if id is not UNSET:
            field_dict["id"] = id

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        recorded_at = d.pop("recorded_at")

        recorded_by = d.pop("recorded_by")

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

        service_providing_group_id = d.pop("service_providing_group_id", UNSET)

        procuring_system_operator_id = d.pop("procuring_system_operator_id", UNSET)

        product_type_id = d.pop("product_type_id", UNSET)

        id = d.pop("id", UNSET)

        service_providing_group_product_application = cls(
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            status=status,
            notes=notes,
            last_prequalified=last_prequalified,
            last_verified=last_verified,
            service_providing_group_id=service_providing_group_id,
            procuring_system_operator_id=procuring_system_operator_id,
            product_type_id=product_type_id,
            id=id,
        )

        service_providing_group_product_application.additional_properties = d
        return service_providing_group_product_application

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
