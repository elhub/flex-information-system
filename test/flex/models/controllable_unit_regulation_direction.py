from enum import StrEnum


class ControllableUnitRegulationDirection(StrEnum):
    BOTH = "both"
    DOWN = "down"
    UP = "up"

    def __str__(self) -> str:
        return str(self.value)
