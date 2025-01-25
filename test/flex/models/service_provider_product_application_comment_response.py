from typing import Any, Dict, List, Type, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_provider_product_application_comment_visibility import (
    ServiceProviderProductApplicationCommentVisibility,
)
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProviderProductApplicationCommentResponse")


@_attrs_define
class ServiceProviderProductApplicationCommentResponse:
    """Response schema for operations with return values - Comment made by a party involved in a service provider product
    application.

        Attributes:
            service_provider_product_application_id (int): Reference to the service provider product application. Example:
                7.
            visibility (Union[Unset, ServiceProviderProductApplicationCommentVisibility]): The level of visibility of the
                comment. Example: same_party.
            content (Union[Unset, str]): Free text content of the comment. Example: Missing document..
            id (Union[Unset, int]): Unique surrogate identifier. Example: 9.
            created_by (Union[Unset, int]): Reference to the identity that created the comment. Example: 94.
            created_at (Union[Unset, str]): When the comment was added to the application. Example: 2022-08-08 12:00:00 CET.
            recorded_at (Union[Unset, str]): When the resource was recorded (created or updated) in the system. Example:
                2023-12-31 23:59:00 CET.
            recorded_by (Union[Unset, int]): The identity that recorded the resource. Example: 145.
    """

    service_provider_product_application_id: int
    visibility: Union[Unset, ServiceProviderProductApplicationCommentVisibility] = UNSET
    content: Union[Unset, str] = UNSET
    id: Union[Unset, int] = UNSET
    created_by: Union[Unset, int] = UNSET
    created_at: Union[Unset, str] = UNSET
    recorded_at: Union[Unset, str] = UNSET
    recorded_by: Union[Unset, int] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        service_provider_product_application_id = self.service_provider_product_application_id

        visibility: Union[Unset, str] = UNSET
        if not isinstance(self.visibility, Unset):
            visibility = self.visibility.value

        content = self.content

        id = self.id

        created_by = self.created_by

        created_at = self.created_at

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "service_provider_product_application_id": service_provider_product_application_id,
            }
        )
        if visibility is not UNSET:
            field_dict["visibility"] = visibility
        if content is not UNSET:
            field_dict["content"] = content
        if id is not UNSET:
            field_dict["id"] = id
        if created_by is not UNSET:
            field_dict["created_by"] = created_by
        if created_at is not UNSET:
            field_dict["created_at"] = created_at
        if recorded_at is not UNSET:
            field_dict["recorded_at"] = recorded_at
        if recorded_by is not UNSET:
            field_dict["recorded_by"] = recorded_by

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        service_provider_product_application_id = d.pop("service_provider_product_application_id")

        _visibility = d.pop("visibility", UNSET)
        visibility: Union[Unset, ServiceProviderProductApplicationCommentVisibility]
        if isinstance(_visibility, Unset):
            visibility = UNSET
        else:
            visibility = ServiceProviderProductApplicationCommentVisibility(_visibility)

        content = d.pop("content", UNSET)

        id = d.pop("id", UNSET)

        created_by = d.pop("created_by", UNSET)

        created_at = d.pop("created_at", UNSET)

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        service_provider_product_application_comment_response = cls(
            service_provider_product_application_id=service_provider_product_application_id,
            visibility=visibility,
            content=content,
            id=id,
            created_by=created_by,
            created_at=created_at,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
        )

        service_provider_product_application_comment_response.additional_properties = d
        return service_provider_product_application_comment_response

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
