from typing import Any, Dict, List, Type, TypeVar, Union, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="ClientResponse")


@_attrs_define
class ClientResponse:
    """Response schema for operations with return values - Client linked to an entity for client credentials and JWT grant
    authentication methods.

        Attributes:
            entity_id (int): Reference to the entity that this client is attached to. Example: 30.
            client_id (Union[Unset, str]): The identifier of the entity. For use with client credentials authentication
                method. Example: addr@flex.test.
            secret (Union[None, Unset, str]): The secret of the entity. For use with client credentials authentication
                method. Input as plain text but stored encrypted. Example: mysupersecretpassword.
            public_key (Union[None, Unset, str]): The public key of the entity (X.509 SubjectPublicKeyInfo). For use with
                JWT grant authentication method. Example: -----BEGIN PUBLIC KEY-----
                MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAq3DnhgYgLVJknvDA3clA
                TozPtjI7yauqD/ZuqgZn4KzzzkQ4BzJar4jRygpzbghlFn0Luk1mdVKzPUgYj0V
                kbRlHyYfxahbgOHixOOnXkKXrtZW7yWGjXPqy/ZJ/+kFBNPAzxy7fDuAzKfU3Rn5
                0sBakg95pua14W1oE4rtd4/U+sg2maCq6HgGdCLLxRWwXA8IBtvHZ48i6kxiz9tu
                -----END PUBLIC KEY-----.
            id (Union[Unset, int]): Unique surrogate identifier. Example: 14.
            recorded_at (Union[Unset, str]): When the resource was recorded (created or updated) in the system. Example:
                2023-12-31 23:59:00 CET.
            recorded_by (Union[Unset, int]): The identity that recorded the resource. Example: 145.
    """

    entity_id: int
    client_id: Union[Unset, str] = UNSET
    secret: Union[None, Unset, str] = UNSET
    public_key: Union[None, Unset, str] = UNSET
    id: Union[Unset, int] = UNSET
    recorded_at: Union[Unset, str] = UNSET
    recorded_by: Union[Unset, int] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        entity_id = self.entity_id

        client_id = self.client_id

        secret: Union[None, Unset, str]
        if isinstance(self.secret, Unset):
            secret = UNSET
        else:
            secret = self.secret

        public_key: Union[None, Unset, str]
        if isinstance(self.public_key, Unset):
            public_key = UNSET
        else:
            public_key = self.public_key

        id = self.id

        recorded_at = self.recorded_at

        recorded_by = self.recorded_by

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "entity_id": entity_id,
            }
        )
        if client_id is not UNSET:
            field_dict["client_id"] = client_id
        if secret is not UNSET:
            field_dict["secret"] = secret
        if public_key is not UNSET:
            field_dict["public_key"] = public_key
        if id is not UNSET:
            field_dict["id"] = id
        if recorded_at is not UNSET:
            field_dict["recorded_at"] = recorded_at
        if recorded_by is not UNSET:
            field_dict["recorded_by"] = recorded_by

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        entity_id = d.pop("entity_id")

        client_id = d.pop("client_id", UNSET)

        def _parse_secret(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        secret = _parse_secret(d.pop("secret", UNSET))

        def _parse_public_key(data: object) -> Union[None, Unset, str]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(Union[None, Unset, str], data)

        public_key = _parse_public_key(d.pop("public_key", UNSET))

        id = d.pop("id", UNSET)

        recorded_at = d.pop("recorded_at", UNSET)

        recorded_by = d.pop("recorded_by", UNSET)

        client_response = cls(
            entity_id=entity_id,
            client_id=client_id,
            secret=secret,
            public_key=public_key,
            id=id,
            recorded_at=recorded_at,
            recorded_by=recorded_by,
        )

        client_response.additional_properties = d
        return client_response

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
