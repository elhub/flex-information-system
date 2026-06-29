from enum import StrEnum


class AccountingPointGridLocationObjectType(StrEnum):
    SUBSTATION = "substation"

    def __str__(self) -> str:
        return str(self.value)
