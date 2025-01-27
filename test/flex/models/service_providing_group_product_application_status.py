from enum import Enum


class ServiceProvidingGroupProductApplicationStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    PREQUALIFICATION_PENDING = "prequalification_pending"
    PREQUALIFIED = "prequalified"
    REJECTED = "rejected"
    REQUESTED = "requested"
    TEMPORARY_QUALIFIED = "temporary_qualified"
    VERIFIED = "verified"

    def __str__(self) -> str:
        return str(self.value)
