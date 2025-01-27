from enum import Enum


class ListServiceProvidingGroupPrefer(str, Enum):
    COUNTNONE = "count=none"

    def __str__(self) -> str:
        return str(self.value)
