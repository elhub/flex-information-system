from enum import Enum


class PartyMembershipUpdateRequestScopesItem(str, Enum):
    AUTHMANAGE = "auth:manage"
    AUTHREAD = "auth:read"
    DATAMANAGE = "data:manage"
    DATAREAD = "data:read"

    def __str__(self) -> str:
        return str(self.value)
