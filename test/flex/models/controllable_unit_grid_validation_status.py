from enum import Enum


class ControllableUnitGridValidationStatus(str, Enum):
    INCOMPLETE_INFORMATION = "incomplete_information"
    IN_PROGRESS = "in_progress"
    PENDING = "pending"
    VALIDATED = "validated"
    VALIDATION_FAILED = "validation_failed"

    def __str__(self) -> str:
        return str(self.value)
