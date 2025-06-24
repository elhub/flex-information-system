from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.service_provider_product_application_comment_visibility import (
    ServiceProviderProductApplicationCommentVisibility,
)
from ..types import UNSET, Unset

T = TypeVar("T", bound="ServiceProviderProductApplicationCommentHistoryResponse")


@_attrs_define
class ServiceProviderProductApplicationCommentHistoryResponse:
    """Service Provider Product Application Comment - history

    Attributes:
        visibility (Union[Unset, ServiceProviderProductApplicationCommentVisibility]): The level of visibility of the
            comment. Example: same_party.
        content (Union[Unset, str]): Free text content of the comment. Example: Missing document..
        service_provider_product_application_id (Union[Unset, int]): Reference to the service provider product
            application. Example: 7.
        recorded_at (Union[Unset, str]): When the resource was recorded (created or updated) in the system. Example:
            2023-12-31 23:59:00 CET.
        recorded_by (Union[Unset, int]): The identity that recorded the resource. Example: 145.
        id (Union[Unset, int]): Unique surrogate identifier. Example: 9.
        created_by (Union[Unset, int]): Reference to the identity that created the comment. Example: 94.
        created_at (Union[Unset, str]): When the comment was added to the application. Example: 2022-08-08 12:00:00 CET.
        service_provider_product_application_comment_id (Union[Unset, int]): Reference to the resource that was updated.
            Example: 48.
        replaced_by (Union[None, Unset, int]): The identity that updated the resource when it was replaced. Example: 90.
        replaced_at (Union[None, Unset, str]): When the resource was replaced in the system. Example: 2024-07-07
            10:00:00 CET.
    """

    visibility: Union[Unset, ServiceProviderProductApplicationCommentVisibility] = UNSET
    content: Union[Unset, str] = UNSET
    service_provider_product_application_id: Union[Unset, int] = UNSET
    recorded_at: Union[Unset, str] = UNSET
    recorded_by: Union[Unset, int] = UNSET
    id: Union[Unset, int] = UNSET
    created_by: Union[Unset, int] = UNSET
    created_at: Union[Unset, str] = UNSET
    service_provider_product_application_comment_id: Union[Unset, int] = UNSET
    replaced_by: Union[None, Unset, int] = UNSET
    replaced_at: Union[None, Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        visibility: Union[Unset, str] = UNSET
        if not isinstance(self.visibility, Unset):
            visibility = self.visibility.value

        content = self.content

        service_provider_product_application_id = self.service_provider_product_application_id

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        id = self.id

        created_by = self.created_by

        created_at = self.created_at

        service_provider_product_application_comment_id = self.service_provider_product_application_comment_id

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
        field_dict.update({})
        if visibility is not UNSET:
            field_dict["visibility"] = visibility
        if content is not UNSET:
            field_dict["content"] = content
        if service_provider_product_application_id is not UNSET:
            field_dict["service_provider_product_application_id"] = service_provider_product_application_id
        if recorded_at is not UNSET:
            field_dict["recorded_at"] = recorded_at
        if recorded_by is not UNSET:
            field_dict["recorded_by"] = recorded_by
        if id is not UNSET:
            field_dict["id"] = id
        if created_by is not UNSET:
            field_dict["created_by"] = created_by
        if created_at is not UNSET:
            field_dict["created_at"] = created_at
        if service_provider_product_application_comment_id is not UNSET:
            field_dict["service_provider_product_application_comment_id"] = (
                service_provider_product_application_comment_id
            )
        if replaced_by is not UNSET:
            field_dict["replaced_by"] = replaced_by
        if replaced_at is not UNSET:
            field_dict["replaced_at"] = replaced_at

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

        service_provider_product_application_id = d.pop("service_provider_product_application_id", UNSET)

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        id = d.pop("id", UNSET)

        created_by = d.pop("created_by", UNSET)

        created_at = d.pop("created_at", UNSET)

        service_provider_product_application_comment_id = d.pop(
            "service_provider_product_application_comment_id", UNSET
        )

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

        service_provider_product_application_comment_history_response = cls(
            visibility=visibility,
            content=content,
            service_provider_product_application_id=service_provider_product_application_id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
            id=id,
            created_by=created_by,
            created_at=created_at,
            service_provider_product_application_comment_id=service_provider_product_application_comment_id,
            replaced_by=replaced_by,
            replaced_at=replaced_at,
        )

        service_provider_product_application_comment_history_response.additional_properties = d
        return service_provider_product_application_comment_history_response

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
