from enum import Enum


class ListServiceProviderProductSuspensionCommentHistoryPrefer(str, Enum):
    COUNTNONE = "count=none"

    def __str__(self) -> str:
        return str(self.value)
