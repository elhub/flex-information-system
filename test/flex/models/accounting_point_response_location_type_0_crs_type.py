from enum import Enum


class AccountingPointResponseLocationType0CrsType(str, Enum):
    NAME = "name"

    def __str__(self) -> str:
        return str(self.value)
