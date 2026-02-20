from enum import Enum


class EnergyDirectionDirection(str, Enum):
    BOTH = "both"
    CONSUMPTION = "consumption"
    PRODUCTION = "production"

    def __str__(self) -> str:
        return str(self.value)
