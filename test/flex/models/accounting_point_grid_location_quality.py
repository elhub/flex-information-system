from enum import Enum


class AccountingPointGridLocationQuality(str, Enum):
    CONFIRMED = "confirmed"
    GUESSED = "guessed"

    def __str__(self) -> str:
        return str(self.value)
