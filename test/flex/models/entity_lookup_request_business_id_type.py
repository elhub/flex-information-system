from enum import StrEnum


class EntityLookupRequestBusinessIdType(StrEnum):
    EMAIL = "email"
    ORG = "org"

    def __str__(self) -> str:
        return str(self.value)
