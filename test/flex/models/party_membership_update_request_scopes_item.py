from enum import Enum


class PartyMembershipUpdateRequestScopesItem(str, Enum):
    ADMIN = "admin"
    READONLY = "readonly"
    SIMPLE = "simple"

    def __str__(self) -> str:
        return str(self.value)
