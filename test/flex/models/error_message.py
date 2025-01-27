from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="ErrorMessage")


@_attrs_define
class ErrorMessage:
    """Error message returned from the API.

    Attributes:
        code (str): The error code. Example: PT418.
        message (str): The error message. Example: error.
        details (Union[None, Unset, str]): Detailed information about the error.
        hint (Union[None, Unset, str]): A hint to help resolve the error.
    """

    code: str
    message: str
    details: Union[None, Unset, str] = UNSET
    hint: Union[None, Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        code = self.code

        message = self.message

        details: Union[None, Unset, str]
        if isinstance(self.details, Unset):
            details = UNSET
        else:
            details = self.details

        hint: Union[None, Unset, str]
        if isinstance(self.hint, Unset):
            hint = UNSET
        else:
            hint = self.hint

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "code": code,
                "message": message,
            }
        )
        if details is not UNSET:
            field_dict["details"] = details
        if hint is not UNSET:
            field_dict["hint"] = hint

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        code = d.pop("code")

        message = d.pop("message")

        def _parse_details(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        details = _parse_details(d.pop("details", UNSET))

        def _parse_hint(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        hint = _parse_hint(d.pop("hint", UNSET))

        error_message = cls(
            code=code,
            message=message,
            details=details,
            hint=hint,
        )

        error_message.additional_properties = d
        return error_message

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
