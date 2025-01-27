from enum import Enum


class PartyStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    NEW = "new"
    SUSPENDED = "suspended"
    TERMINATED = "terminated"

    def __str__(self) -> str:
        return str(self.value)
