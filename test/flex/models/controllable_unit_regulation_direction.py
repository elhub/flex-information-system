from enum import Enum


class ControllableUnitRegulationDirection(str, Enum):
    BOTH = "both"
    DOWN = "down"
    UP = "up"

    def __str__(self) -> str:
        return str(self.value)
