from enum import Enum


class EntityBusinessIdType(str, Enum):
    EMAIL = "email"
    ORG = "org"
    PID = "pid"

    def __str__(self) -> str:
        return str(self.value)
