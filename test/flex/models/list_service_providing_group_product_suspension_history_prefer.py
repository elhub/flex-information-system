from enum import Enum


class ListServiceProvidingGroupProductSuspensionHistoryPrefer(str, Enum):
    COUNTNONE = "count=none"

    def __str__(self) -> str:
        return str(self.value)
