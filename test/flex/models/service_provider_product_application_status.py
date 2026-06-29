from enum import StrEnum


class ServiceProviderProductApplicationStatus(StrEnum):
    COMMUNICATION_TEST = "communication_test"
    IN_PROGRESS = "in_progress"
    NOT_QUALIFIED = "not_qualified"
    QUALIFIED = "qualified"
    REQUESTED = "requested"

    def __str__(self) -> str:
        return str(self.value)
