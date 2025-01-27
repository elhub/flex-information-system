from enum import Enum


class ServiceProvidingGroupStatus(str, Enum):
    ACTIVE = "active"
    NEW = "new"
    TERMINATED = "terminated"

    def __str__(self) -> str:
        return str(self.value)
