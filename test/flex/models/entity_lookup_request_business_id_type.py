from enum import Enum


class EntityLookupRequestBusinessIdType(str, Enum):
    EMAIL = "email"
    ORG = "org"

    def __str__(self) -> str:
        return str(self.value)
