from __future__ import annotations

from collections.abc import Mapping
from io import BytesIO
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from .. import types
from ..types import File

T = TypeVar("T", bound="CreateServiceProvidingGroupProductApplicationAttachmentBody")


@_attrs_define
class CreateServiceProvidingGroupProductApplicationAttachmentBody:
    """
    Attributes:
        service_providing_group_product_application_id (int): Reference to the
            service_providing_group_product_application.
        file (File): File to upload.
    """

    service_providing_group_product_application_id: int
    file: File
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        service_providing_group_product_application_id = self.service_providing_group_product_application_id

        file = self.file.to_tuple()

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "service_providing_group_product_application_id": service_providing_group_product_application_id,
                "file": file,
            }
        )

        return field_dict

    def to_multipart(self) -> types.RequestFiles:
        files: types.RequestFiles = []

        files.append(
            (
                "service_providing_group_product_application_id",
                (None, str(self.service_providing_group_product_application_id).encode(), "text/plain"),
            )
        )

        files.append(("file", self.file.to_tuple()))

        for prop_name, prop in self.additional_properties.items():
            files.append((prop_name, (None, str(prop).encode(), "text/plain")))

        return files

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        service_providing_group_product_application_id = d.pop("service_providing_group_product_application_id")

        file = File(payload=BytesIO(d.pop("file")))

        create_service_providing_group_product_application_attachment_body = cls(
            service_providing_group_product_application_id=service_providing_group_product_application_id,
            file=file,
        )

        create_service_providing_group_product_application_attachment_body.additional_properties = d
        return create_service_providing_group_product_application_attachment_body

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
