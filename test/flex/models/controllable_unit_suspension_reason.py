from enum import StrEnum


class ControllableUnitSuspensionReason(StrEnum):
    COMPROMISES_SAFE_OPERATION = "compromises_safe_operation"
    OTHER = "other"

    def __str__(self) -> str:
        return str(self.value)
