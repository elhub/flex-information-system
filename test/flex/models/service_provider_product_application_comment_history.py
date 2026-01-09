from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_provider_product_application_comment_visibility import (
    ServiceProviderProductApplicationCommentVisibility,
)
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProviderProductApplicationCommentHistory")


@_attrs_define
class ServiceProviderProductApplicationCommentHistory:
    """Service Provider Product Application Comment - history

    Attributes:
        id (int): Unique surrogate identifier. Example: 9.
        service_provider_product_application_id (int): Reference to the service provider product application. Example:
            7.
        created_by (int): Reference to the identity that created the comment. Example: 94.
        created_at (str): When the comment was added to the SPPA. Example: 2022-08-08 12:00:00 CET.
        visibility (ServiceProviderProductApplicationCommentVisibility): The level of visibility of the comment.
            Example: same_party.
        content (str): Free text content of the comment. Example: Missing document..
        recorded_at (str): When the resource was recorded (created or updated) in the system. Example: 2023-12-31
            23:59:00 CET.
        recorded_by (int): The identity that recorded the resource. Example: 145.
        service_provider_product_application_comment_id (int): Reference to the resource that was updated. Example: 48.
        replaced_by (int | None | Unset): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (None | str | Unset): When the resource was replaced in the system. Example: 2024-07-07 10:00:00
            CET.
    """

    id: int
    service_provider_product_application_id: int
    created_by: int
    created_at: str
    visibility: ServiceProviderProductApplicationCommentVisibility
    content: str
    recorded_at: str
    recorded_by: int
    service_provider_product_application_comment_id: int
    replaced_by: int | None | Unset = UNSET
    replaced_at: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        id = self.id

        service_provider_product_application_id = self.service_provider_product_application_id

        created_by = self.created_by

        created_at = self.created_at

        visibility = self.visibility.value

        content = self.content

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        service_provider_product_application_comment_id = self.service_provider_product_application_comment_id

        replaced_by: int | None | Unset
        if isinstance(self.replaced_by, Unset):
            replaced_by = UNSET
        else:
            replaced_by = self.replaced_by

        replaced_at: None | str | Unset
        if isinstance(self.replaced_at, Unset):
            replaced_at = UNSET
        else:
            replaced_at = self.replaced_at

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "service_provider_product_application_id": service_provider_product_application_id,
                "created_by": created_by,
                "created_at": created_at,
                "visibility": visibility,
                "content": content,
                "recorded_at": recorded_at,
                "recorded_by": recorded_by,
                "service_provider_product_application_comment_id": service_provider_product_application_comment_id,
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

        service_provider_product_application_id = d.pop("service_provider_product_application_id")

        created_by = d.pop("created_by")

        created_at = d.pop("created_at")

        visibility = ServiceProviderProductApplicationCommentVisibility(d.pop("visibility"))

        content = d.pop("content")

        recorded_at = d.pop("recorded_at")

        recorded_by = d.pop("recorded_by")

        service_provider_product_application_comment_id = d.pop("service_provider_product_application_comment_id")

        def _parse_replaced_by(data: object) -> int | None | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(int | None | Unset, data)

        replaced_by = _parse_replaced_by(d.pop("replaced_by", UNSET))

        def _parse_replaced_at(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        replaced_at = _parse_replaced_at(d.pop("replaced_at", UNSET))

        service_provider_product_application_comment_history = cls(
            id=id,
            service_provider_product_application_id=service_provider_product_application_id,
            created_by=created_by,
            created_at=created_at,
            visibility=visibility,
            content=content,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            service_provider_product_application_comment_id=service_provider_product_application_comment_id,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
        )

        service_provider_product_application_comment_history.additional_properties = d
        return service_provider_product_application_comment_history

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
