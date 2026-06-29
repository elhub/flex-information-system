from enum import StrEnum


class ControllableUnitStatus(StrEnum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    NEW = "new"
    TERMINATED = "terminated"

    def __str__(self) -> str:
        return str(self.value)
