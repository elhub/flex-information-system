from enum import StrEnum


class ServiceProvidingGroupGridPrequalificationStatus(StrEnum):
    APPROVED = "approved"
    CONDITIONALLY_APPROVED = "conditionally_approved"
    IN_PROGRESS = "in_progress"
    NOT_APPROVED = "not_approved"
    REQUESTED = "requested"

    def __str__(self) -> str:
        return str(self.value)
