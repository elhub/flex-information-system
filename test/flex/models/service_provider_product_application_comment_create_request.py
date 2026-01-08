from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_provider_product_application_comment_visibility import (
    ServiceProviderProductApplicationCommentVisibility,
)
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProviderProductApplicationCommentCreateRequest")


@_attrs_define
class ServiceProviderProductApplicationCommentCreateRequest:
    """Request schema for create operations - Comment made by a party involved in a service provider product application.

    Attributes:
        service_provider_product_application_id (int): Reference to the service provider product application. Example:
            7.
        content (str): Free text content of the comment. Example: Missing document..
        visibility (ServiceProviderProductApplicationCommentVisibility | Unset): The level of visibility of the comment.
            Example: same_party.
    """

    service_provider_product_application_id: int
    content: str
    visibility: ServiceProviderProductApplicationCommentVisibility | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        service_provider_product_application_id = self.service_provider_product_application_id

        content = self.content

        visibility: str | Unset = UNSET
        if not isinstance(self.visibility, Unset):
            visibility = self.visibility.value

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "service_provider_product_application_id": service_provider_product_application_id,
                "content": content,
            }
        )
        if visibility is not UNSET:
            field_dict["visibility"] = visibility

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        service_provider_product_application_id = d.pop("service_provider_product_application_id")

        content = d.pop("content")

        _visibility = d.pop("visibility", UNSET)
        visibility: ServiceProviderProductApplicationCommentVisibility | Unset
        if isinstance(_visibility, Unset):
            visibility = UNSET
        else:
            visibility = ServiceProviderProductApplicationCommentVisibility(_visibility)

        service_provider_product_application_comment_create_request = cls(
            service_provider_product_application_id=service_provider_product_application_id,
            content=content,
            visibility=visibility,
        )

        service_provider_product_application_comment_create_request.additional_properties = d
        return service_provider_product_application_comment_create_request

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
