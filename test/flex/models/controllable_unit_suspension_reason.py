from enum import Enum


class ControllableUnitSuspensionReason(str, Enum):
    COMPROMISES_SAFE_OPERATION = "compromises_safe_operation"
    OTHER = "other"

    def __str__(self) -> str:
        return str(self.value)
