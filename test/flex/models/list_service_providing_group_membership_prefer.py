from enum import Enum


class ListServiceProvidingGroupMembershipPrefer(str, Enum):
    COUNTNONE = "count=none"

    def __str__(self) -> str:
        return str(self.value)
