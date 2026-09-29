from enum import StrEnum


class ServiceProvidingGroupProductApplicationStatus(StrEnum):
    PREQUALIFICATION = "prequalification"
    PREQUALIFIED = "prequalified"
    REJECTED = "rejected"
    REQUESTED = "requested"
    TEMPORARY_QUALIFIED = "temporary_qualified"
    TERMINATED = "terminated"
    VERIFIED = "verified"

    def __str__(self) -> str:
        return str(self.value)
