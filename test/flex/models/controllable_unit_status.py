from enum import Enum


class ControllableUnitStatus(str, Enum):
    ACTIVE = "active"
    NEW = "new"
    SUSPENDED = "suspended"
    TERMINATED = "terminated"

    def __str__(self) -> str:
        return str(self.value)
