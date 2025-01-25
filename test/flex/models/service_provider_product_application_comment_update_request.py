from typing import Any, Dict, List, Type, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_provider_product_application_comment_visibility import (
    ServiceProviderProductApplicationCommentVisibility,
)
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProviderProductApplicationCommentUpdateRequest")


@_attrs_define
class ServiceProviderProductApplicationCommentUpdateRequest:
    """Request schema for update operations - Comment made by a party involved in a service provider product application.

    Attributes:
        visibility (Union[Unset, ServiceProviderProductApplicationCommentVisibility]): The level of visibility of the
            comment. Example: same_party.
        content (Union[Unset, str]): Free text content of the comment. Example: Missing document..
    """

    visibility: Union[Unset, ServiceProviderProductApplicationCommentVisibility] = UNSET
    content: Union[Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        visibility: Union[Unset, str] = UNSET
        if not isinstance(self.visibility, Unset):
            visibility = self.visibility.value

        content = self.content

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if visibility is not UNSET:
            field_dict["visibility"] = visibility
        if content is not UNSET:
            field_dict["content"] = content

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        _visibility = d.pop("visibility", UNSET)
        visibility: Union[Unset, ServiceProviderProductApplicationCommentVisibility]
        if isinstance(_visibility, Unset):
            visibility = UNSET
        else:
            visibility = ServiceProviderProductApplicationCommentVisibility(_visibility)

        content = d.pop("content", UNSET)

        service_provider_product_application_comment_update_request = cls(
            visibility=visibility,
            content=content,
        )

        service_provider_product_application_comment_update_request.additional_properties = d
        return service_provider_product_application_comment_update_request

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
