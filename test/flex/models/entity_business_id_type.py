from enum import StrEnum


class EntityBusinessIdType(StrEnum):
    EMAIL = "email"
    ORG = "org"
    PID = "pid"

    def __str__(self) -> str:
        return str(self.value)
