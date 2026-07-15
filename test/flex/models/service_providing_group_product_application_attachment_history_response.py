from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_product_application_attachment_content_type import (
    ServiceProvidingGroupProductApplicationAttachmentContentType,
)
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProvidingGroupProductApplicationAttachmentHistoryResponse")


@_attrs_define
class ServiceProvidingGroupProductApplicationAttachmentHistoryResponse:
    """Service Providing Group Product Application Attachment - history

    Attributes:
        id (int): Unique surrogate identifier. Example: 9.
        service_providing_group_product_application_id (int): Reference to the service providing group product
            application. Example: 7.
        object_id (str): Identifier of the object to which the attachment is linked. Example:
            08aa9239-d209-4c15-a916-2b4942ce45ee.
        filename (str): Original filename of the attachment. Example: document.pdf.
        filename_sanitised (str): Sanitised filename safe for storage. Example: document.pdf.
        content_type (ServiceProvidingGroupProductApplicationAttachmentContentType): MIME type of the attachment.
            Example: application/pdf.
        size_bytes (int): Size of the attachment in bytes. Example: 204800.
        recorded_at (datetime.datetime): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31T23:59:00+00:00.
        recorded_by (int): The identity that recorded the resource. Example: 145.
        service_providing_group_product_application_attachment_id (int): Reference to the resource that was updated.
            Example: 48.
        replaced_by (int | None | Unset): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (datetime.datetime | None | Unset): When the resource was replaced in the system. Example:
            2024-07-07T10:00:00+00:00.
    """

    id: int
    service_providing_group_product_application_id: int
    object_id: str
    filename: str
    filename_sanitised: str
    content_type: ServiceProvidingGroupProductApplicationAttachmentContentType
    size_bytes: int
    recorded_at: datetime.datetime
    recorded_by: int
    service_providing_group_product_application_attachment_id: int
    replaced_by: int | None | Unset = UNSET
    replaced_at: datetime.datetime | None | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        service_providing_group_product_application_id = self.service_providing_group_product_application_id

        object_id = self.object_id

        filename = self.filename

        filename_sanitised = self.filename_sanitised

        content_type = self.content_type.value

        size_bytes = self.size_bytes

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        service_providing_group_product_application_attachment_id = (
            self.service_providing_group_product_application_attachment_id
        )

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
                "service_providing_group_product_application_id": service_providing_group_product_application_id,
                "object_id": object_id,
                "filename": filename,
                "filename_sanitised": filename_sanitised,
                "content_type": content_type,
                "size_bytes": size_bytes,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
                "service_providing_group_product_application_attachment_id": service_providing_group_product_application_attachment_id,
            }
        )
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        id = d.pop("id")

        service_providing_group_product_application_id = d.pop("service_providing_group_product_application_id")

        object_id = d.pop("object_id")

        filename = d.pop("filename")

        filename_sanitised = d.pop("filename_sanitised")

        content_type = ServiceProvidingGroupProductApplicationAttachmentContentType(d.pop("content_type"))

        size_bytes = d.pop("size_bytes")

        recorded_at = datetime.datetime.fromisoformat(d.pop("recorded_at"))

        recorded_by = d.pop("recorded_by")

        service_providing_group_product_application_attachment_id = d.pop(
            "service_providing_group_product_application_attachment_id"
        )

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

        service_providing_group_product_application_attachment_history_response = cls(
            id=id,
            service_providing_group_product_application_id=service_providing_group_product_application_id,
            object_id=object_id,
            filename=filename,
            filename_sanitised=filename_sanitised,
            content_type=content_type,
            size_bytes=size_bytes,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            service_providing_group_product_application_attachment_id=service_providing_group_product_application_attachment_id,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
        )

        service_providing_group_product_application_attachment_history_response.additional_properties = d
        return service_providing_group_product_application_attachment_history_response

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
