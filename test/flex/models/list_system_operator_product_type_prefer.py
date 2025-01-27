from enum import Enum


class ListSystemOperatorProductTypePrefer(str, Enum):
    COUNTNONE = "count=none"

    def __str__(self) -> str:
        return str(self.value)
