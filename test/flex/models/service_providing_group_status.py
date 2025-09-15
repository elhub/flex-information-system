from enum import Enum


class ServiceProvidingGroupStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    NEW = "new"
    TERMINATED = "terminated"

    def __str__(self) -> str:
        return str(self.value)
