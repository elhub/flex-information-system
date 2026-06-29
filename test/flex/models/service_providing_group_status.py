from enum import StrEnum


class ServiceProvidingGroupStatus(StrEnum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    NEW = "new"
    TERMINATED = "terminated"

    def __str__(self) -> str:
        return str(self.value)
