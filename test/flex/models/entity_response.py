from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="EntityResponse")


@_attrs_define
class EntityResponse:
    """Response schema for operations with return values - Entity - Natural or legal person

    An entity is a natural or legal person that can be a party in the Flexibility Information System.

    Example entity types:

    * Person
    * Organisation

        Attributes:
            client_id (Union[Unset, str]): The identifier of the entity. For use with client credentials authentication
                method. Example: addr@flex.test.
            client_secret (Union[None, Unset, str]): The secret of the entity. For use with client credentials
                authentication method. Input as plain text but stored encrypted. Example: mysupersecretpassword.
            client_public_key (Union[None, Unset, str]): The public key of the entity (X.509 SubjectPublicKeyInfo). For use
                with JWT grant authentication method. Example: -----BEGIN PUBLIC KEY-----
                MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAq3DnhgYgLVJknvDA3clA
                TozPtjI7yauqD/ZuqgZn4KzzzkQ4BzJar4jRygpzbghlFn0Luk1mdVKzPUgYj0V
                kbRlHyYfxahbgOHixOOnXkKXrtZW7yWGjXPqy/ZJ/+kFBNPAzxy7fDuAzKfU3Rn5
                0sBakg95pua14W1oE4rtd4/U+sg2maCq6HgGdCLLxRWwXA8IBtvHZ48i6kxiz9tu
                -----END PUBLIC KEY-----.
            id (Union[Unset, int]): Unique surrogate identifier.

                Note:
                This is a Primary Key. Example: 14.
            business_id (Union[Unset, str]): The business identifier of the entity. Format depends on `business_id_type`.
                Example: example@flex.test.
            business_id_type (Union[Unset, str]): The type of the business identifier. Example: email.
            name (Union[Unset, str]): Name of the entity. Maximum 128 characters. Example: John Smith.
            type (Union[Unset, str]): The type of the entity, e.g Person, Organisation Example: person.
    """

    client_id: Union[Unset, str] = UNSET
    client_secret: Union[None, Unset, str] = UNSET
    client_public_key: Union[None, Unset, str] = UNSET
    id: Union[Unset, int] = UNSET
    business_id: Union[Unset, str] = UNSET
    business_id_type: Union[Unset, str] = UNSET
    name: Union[Unset, str] = UNSET
    type: Union[Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        client_id = self.client_id

        client_secret: Union[None, Unset, str]
        if isinstance(self.client_secret, Unset):
            client_secret = UNSET
        else:
            client_secret = self.client_secret

        client_public_key: Union[None, Unset, str]
        if isinstance(self.client_public_key, Unset):
            client_public_key = UNSET
        else:
            client_public_key = self.client_public_key

        id = self.id

        business_id = self.business_id

        business_id_type = self.business_id_type

        name = self.name

        type = self.type

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if client_id is not UNSET:
            field_dict["client_id"] = client_id
        if client_secret is not UNSET:
            field_dict["client_secret"] = client_secret
        if client_public_key is not UNSET:
            field_dict["client_public_key"] = client_public_key
        if id is not UNSET:
            field_dict["id"] = id
        if business_id is not UNSET:
            field_dict["business_id"] = business_id
        if business_id_type is not UNSET:
            field_dict["business_id_type"] = business_id_type
        if name is not UNSET:
            field_dict["name"] = name
        if type is not UNSET:
            field_dict["type"] = type

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        client_id = d.pop("client_id", UNSET)

        def _parse_client_secret(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        client_secret = _parse_client_secret(d.pop("client_secret", UNSET))

        def _parse_client_public_key(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        client_public_key = _parse_client_public_key(d.pop("client_public_key", UNSET))

        id = d.pop("id", UNSET)

        business_id = d.pop("business_id", UNSET)

        business_id_type = d.pop("business_id_type", UNSET)

        name = d.pop("name", UNSET)

        type = d.pop("type", UNSET)

        entity_response = cls(
            client_id=client_id,
            client_secret=client_secret,
            client_public_key=client_public_key,
            id=id,
            business_id=business_id,
            business_id_type=business_id_type,
            name=name,
            type=type,
        )

        entity_response.additional_properties = d
        return entity_response

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
