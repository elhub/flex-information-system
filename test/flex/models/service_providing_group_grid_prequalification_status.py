from enum import Enum


class ServiceProvidingGroupGridPrequalificationStatus(str, Enum):
    APPROVED = "approved"
    CONDITIONALLY_APPROVED = "conditionally_approved"
    IN_PROGRESS = "in_progress"
    NOT_APPROVED = "not_approved"
    REQUESTED = "requested"

    def __str__(self) -> str:
        return str(self.value)
