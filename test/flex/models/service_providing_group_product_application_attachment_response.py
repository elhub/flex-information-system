from __future__ import annotations

import datetime
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_providing_group_product_application_attachment_content_type import (
    ServiceProvidingGroupProductApplicationAttachmentContentType,
)
from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.service_providing_group_product_application_response import (
        ServiceProvidingGroupProductApplicationResponse,
    )


T = TypeVar("T", bound="ServiceProvidingGroupProductApplicationAttachmentResponse")


@_attrs_define
class ServiceProvidingGroupProductApplicationAttachmentResponse:
    """Response schema - File attachment associated with a service providing group product application, allowing involved
    parties to exchange supporting documents.

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
            service_providing_group_product_application (None | ServiceProvidingGroupProductApplicationResponse | Unset):
                Embedded service_providing_group_product_application
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
    service_providing_group_product_application: None | ServiceProvidingGroupProductApplicationResponse | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        from ..models.service_providing_group_product_application_response import (
            ServiceProvidingGroupProductApplicationResponse,
        )

        id = self.id

        service_providing_group_product_application_id = self.service_providing_group_product_application_id

        object_id = self.object_id

        filename = self.filename

        filename_sanitised = self.filename_sanitised

        content_type = self.content_type.value

        size_bytes = self.size_bytes

        recorded_at = self.recorded_at.isoformat()

        recorded_by = self.recorded_by

        service_providing_group_product_application: dict[str, Any] | None | Unset
        if isinstance(self.service_providing_group_product_application, Unset):
            service_providing_group_product_application = UNSET
        elif isinstance(
            self.service_providing_group_product_application, ServiceProvidingGroupProductApplicationResponse
        ):
            service_providing_group_product_application = self.service_providing_group_product_application.to_dict()
        else:
            service_providing_group_product_application = self.service_providing_group_product_application

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
            }
        )
        if service_providing_group_product_application is not UNSET:
            field_dict["service_providing_group_product_application"] = service_providing_group_product_application

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        from ..models.service_providing_group_product_application_response import (
            ServiceProvidingGroupProductApplicationResponse,
        )

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

        def _parse_service_providing_group_product_application(
            data: object,
        ) -> None | ServiceProvidingGroupProductApplicationResponse | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                service_providing_group_product_application_type_0 = (
                    ServiceProvidingGroupProductApplicationResponse.from_dict(data)
                )

                return service_providing_group_product_application_type_0
            except (TypeError, ValueError, AttributeError, KeyError):
                pass
            return cast(None | ServiceProvidingGroupProductApplicationResponse | Unset, data)

        service_providing_group_product_application = _parse_service_providing_group_product_application(
            d.pop("service_providing_group_product_application", UNSET)
        )

        service_providing_group_product_application_attachment_response = cls(
            id=id,
            service_providing_group_product_application_id=service_providing_group_product_application_id,
            object_id=object_id,
            filename=filename,
            filename_sanitised=filename_sanitised,
            content_type=content_type,
            size_bytes=size_bytes,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            service_providing_group_product_application=service_providing_group_product_application,
        )

        service_providing_group_product_application_attachment_response.additional_properties = d
        return service_providing_group_product_application_attachment_response

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
