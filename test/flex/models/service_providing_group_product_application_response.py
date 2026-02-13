from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_product_application_status import ServiceProvidingGroupProductApplicationStatus
from ..types import UNSET, Unset

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
            status (ServiceProvidingGroupProductApplicationStatus): The status of the application. Example: in_progress.
            recorded_at (str): When the resource was recorded (created or updated) in the system. Example:
                2023-12-31T23:59:00Z.
            recorded_by (int): The identity that recorded the resource. Example: 145.
            notes (None | str | Unset): Free text notes on the current product application status.
            prequalified_at (None | str | Unset): When the product application was last prequalified. Example:
                2022-08-08T12:00:00+02.
            verified_at (None | str | Unset): When the product application was last verified. Example:
                2021-08-08T10:00:00+02.
    """

    id: int
    service_providing_group_id: int
    procuring_system_operator_id: int
    product_type_ids: list[int]
    status: ServiceProvidingGroupProductApplicationStatus
    recorded_at: str
    recorded_by: int
    notes: None | str | Unset = UNSET
    prequalified_at: None | str | Unset = UNSET
    verified_at: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        service_providing_group_id = self.service_providing_group_id

        procuring_system_operator_id = self.procuring_system_operator_id

        product_type_ids = self.product_type_ids

        status = self.status.value

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        notes: None | str | Unset
        if isinstance(self.notes, Unset):
            notes = UNSET
        else:
            notes = self.notes

        prequalified_at: None | str | Unset
        if isinstance(self.prequalified_at, Unset):
            prequalified_at = UNSET
        else:
            prequalified_at = self.prequalified_at

        verified_at: None | str | Unset
        if isinstance(self.verified_at, Unset):
            verified_at = UNSET
        else:
            verified_at = self.verified_at

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "service_providing_group_id": service_providing_group_id,
                "procuring_system_operator_id": procuring_system_operator_id,
                "product_type_ids": product_type_ids,
                "status": status,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
            }
        )
        if notes is not UNSET:
            field_dict["notes"] = notes
        if prequalified_at is not UNSET:
            field_dict["prequalified_at"] = prequalified_at
        if verified_at is not UNSET:
            field_dict["verified_at"] = verified_at

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        service_providing_group_id = d.pop("service_providing_group_id")

        procuring_system_operator_id = d.pop("procuring_system_operator_id")

        product_type_ids = cast(list[int], d.pop("product_type_ids"))

        status = ServiceProvidingGroupProductApplicationStatus(d.pop("status"))

        recorded_at = d.pop("recorded_at")

        recorded_by = d.pop("recorded_by")

        def _parse_notes(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        notes = _parse_notes(d.pop("notes", UNSET))

        def _parse_prequalified_at(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        prequalified_at = _parse_prequalified_at(d.pop("prequalified_at", UNSET))

        def _parse_verified_at(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        verified_at = _parse_verified_at(d.pop("verified_at", UNSET))

        service_providing_group_product_application_response = cls(
            id=id,
            service_providing_group_id=service_providing_group_id,
            procuring_system_operator_id=procuring_system_operator_id,
            product_type_ids=product_type_ids,
            status=status,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            notes=notes,
            prequalified_at=prequalified_at,
            verified_at=verified_at,
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
