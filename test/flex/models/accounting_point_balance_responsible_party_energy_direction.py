from enum import Enum


class AccountingPointBalanceResponsiblePartyEnergyDirection(str, Enum):
    CONSUMPTION = "consumption"
    PRODUCTION = "production"

    def __str__(self) -> str:
        return str(self.value)
