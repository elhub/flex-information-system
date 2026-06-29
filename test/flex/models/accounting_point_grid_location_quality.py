from enum import StrEnum


class AccountingPointGridLocationQuality(StrEnum):
    CONFIRMED = "confirmed"
    GUESSED = "guessed"

    def __str__(self) -> str:
        return str(self.value)
