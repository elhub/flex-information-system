from enum import Enum


class AccountingPointGridLocationObjectType(str, Enum):
    SUBSTATION = "substation"
    TRANSFORMER = "transformer"

    def __str__(self) -> str:
        return str(self.value)
