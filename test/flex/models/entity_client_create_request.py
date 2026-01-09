from __future__ import annotations

from collections.abc import Mapping
from typing import Any, TypeVar, cast

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.auth_scope import AuthScope
from ..types import UNSET, Unset

T = TypeVar("T", bound="EntityClientCreateRequest")


@_attrs_define
class EntityClientCreateRequest:
    """Request schema for create operations - Client linked to an entity for client credentials and JWT grant
    authentication methods.

        Attributes:
            entity_id (int): Reference to the entity that this client is attached to. Example: 30.
            client_id (str): The identifier of the entity. For use with client credentials authentication method. Example:
                addr@flex.test.
            party_id (int): Reference to the party this client allows to assume. A null value means the client cannot assume
                any party. Example: 30.
            scopes (list[AuthScope]): List of scopes granted to the user when it logs in as an entity or when it acts as the
                party. When assuming a party through party membership, the least privileged set of scopes will be kept.
                Scopes are inspired from OAuth 2.0 and allow refinement of access control and privilege delegation mechanisms.
                Example: ['read:data'].
            name (None | str | Unset): Name of the client. Example: Laptop.
            client_secret (None | str | Unset): The secret of the entity. For use with client credentials authentication
                method. Input as plain text but stored encrypted. Example: mysupersecretpassword.
            public_key (None | str | Unset): The public key of the entity (X.509 SubjectPublicKeyInfo). For use with JWT
                grant authentication method. Example: -----BEGIN PUBLIC KEY-----
                MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAq3DnhgYgLVJknvDA3clA
                TozPtjI7yauqD/ZuqgZn4KzzzkQ4BzJar4jRygpzbghlFn0Luk1mdVKzPUgYj0V
                kbRlHyYfxahbgOHixOOnXkKXrtZW7yWGjXPqy/ZJ/+kFBNPAzxy7fDuAzKfU3Rn5
                0sBakg95pua14W1oE4rtd4/U+sg2maCq6HgGdCLLxRWwXA8IBtvHZ48i6kxiz9tu
                -----END PUBLIC KEY-----.
    """

    entity_id: int
    client_id: str
    party_id: int
    scopes: list[AuthScope]
    name: None | str | Unset = UNSET
    client_secret: None | str | Unset = UNSET
    public_key: None | str | Unset = UNSET
    additional_properties: dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> dict[str, Any]:
        entity_id = self.entity_id

        client_id = self.client_id

        party_id = self.party_id

        scopes = []
        for scopes_item_data in self.scopes:
            scopes_item = scopes_item_data.value
            scopes.append(scopes_item)

        name: None | str | Unset
        if isinstance(self.name, Unset):
            name = UNSET
        else:
            name = self.name

        client_secret: None | str | Unset
        if isinstance(self.client_secret, Unset):
            client_secret = UNSET
        else:
            client_secret = self.client_secret

        public_key: None | str | Unset
        if isinstance(self.public_key, Unset):
            public_key = UNSET
        else:
            public_key = self.public_key

        field_dict: dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "entity_id": entity_id,
                "client_id": client_id,
                "party_id": party_id,
                "scopes": scopes,
            }
        )
        if name is not UNSET:
            field_dict["name"] = name
        if client_secret is not UNSET:
            field_dict["client_secret"] = client_secret
        if public_key is not UNSET:
            field_dict["public_key"] = public_key

        return field_dict

    @classmethod
    def from_dict(cls: type[T], src_dict: Mapping[str, Any]) -> T:
        d = dict(src_dict)
        entity_id = d.pop("entity_id")

        client_id = d.pop("client_id")

        party_id = d.pop("party_id")

        scopes = []
        _scopes = d.pop("scopes")
        for scopes_item_data in _scopes:
            scopes_item = AuthScope(scopes_item_data)

            scopes.append(scopes_item)

        def _parse_name(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        name = _parse_name(d.pop("name", UNSET))

        def _parse_client_secret(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        client_secret = _parse_client_secret(d.pop("client_secret", UNSET))

        def _parse_public_key(data: object) -> None | str | Unset:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            return cast(None | str | Unset, data)

        public_key = _parse_public_key(d.pop("public_key", UNSET))

        entity_client_create_request = cls(
            entity_id=entity_id,
            client_id=client_id,
            party_id=party_id,
            scopes=scopes,
            name=name,
            client_secret=client_secret,
            public_key=public_key,
        )

        entity_client_create_request.additional_properties = d
        return entity_client_create_request

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
