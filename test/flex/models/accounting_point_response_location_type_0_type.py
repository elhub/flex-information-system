from enum import Enum


class AccountingPointResponseLocationType0Type(str, Enum):
    POINT = "Point"

    def __str__(self) -> str:
        return str(self.value)
