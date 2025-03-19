from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="EntityClientUpdateRequest")


@_attrs_define
class EntityClientUpdateRequest:
    """Request schema for update operations - Client linked to an entity for client credentials and JWT grant
    authentication methods.

        Attributes:
            name (Union[None, Unset, str]): Name of the client. Maximum 64 characters. Example: Laptop.
            client_id (Union[Unset, str]): The identifier of the entity. For use with client credentials authentication
                method. Example: addr@flex.test.
            client_secret (Union[None, Unset, str]): The secret of the entity. For use with client credentials
                authentication method. Input as plain text but stored encrypted. Example: mysupersecretpassword.
            public_key (Union[None, Unset, str]): The public key of the entity (X.509 SubjectPublicKeyInfo). For use with
                JWT grant authentication method. Example: -----BEGIN PUBLIC KEY-----
                MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAq3DnhgYgLVJknvDA3clA
                TozPtjI7yauqD/ZuqgZn4KzzzkQ4BzJar4jRygpzbghlFn0Luk1mdVKzPUgYj0V
                kbRlHyYfxahbgOHixOOnXkKXrtZW7yWGjXPqy/ZJ/+kFBNPAzxy7fDuAzKfU3Rn5
                0sBakg95pua14W1oE4rtd4/U+sg2maCq6HgGdCLLxRWwXA8IBtvHZ48i6kxiz9tu
                -----END PUBLIC KEY-----.
    """

    name: Union[None, Unset, str] = UNSET
    client_id: Union[Unset, str] = UNSET
    client_secret: Union[None, Unset, str] = UNSET
    public_key: Union[None, Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        name: Union[None, Unset, str]
        if isinstance(self.name, Unset):
            name = UNSET
        else:
            name = self.name

        client_id = self.client_id

        client_secret: Union[None, Unset, str]
        if isinstance(self.client_secret, Unset):
            client_secret = UNSET
        else:
            client_secret = self.client_secret

        public_key: Union[None, Unset, str]
        if isinstance(self.public_key, Unset):
            public_key = UNSET
        else:
            public_key = self.public_key

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if name is not UNSET:
            field_dict["name"] = name
        if client_id is not UNSET:
            field_dict["client_id"] = client_id
        if client_secret is not UNSET:
            field_dict["client_secret"] = client_secret
        if public_key is not UNSET:
            field_dict["public_key"] = public_key

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()

        def _parse_name(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        name = _parse_name(d.pop("name", UNSET))

        client_id = d.pop("client_id", UNSET)

        def _parse_client_secret(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        client_secret = _parse_client_secret(d.pop("client_secret", UNSET))

        def _parse_public_key(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        public_key = _parse_public_key(d.pop("public_key", UNSET))

        entity_client_update_request = cls(
            name=name,
            client_id=client_id,
            client_secret=client_secret,
            public_key=public_key,
        )

        entity_client_update_request.additional_properties = d
        return entity_client_update_request

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
