from enum import StrEnum


class AccountingPointBalanceResponsiblePartyEnergyDirection(StrEnum):
    CONSUMPTION = "consumption"
    PRODUCTION = "production"

    def __str__(self) -> str:
        return str(self.value)
