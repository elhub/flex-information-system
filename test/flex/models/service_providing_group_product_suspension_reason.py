from enum import StrEnum


class ServiceProvidingGroupProductSuspensionReason(StrEnum):
    FAILED_VERIFICATION = "failed_verification"
    OTHER = "other"

    def __str__(self) -> str:
        return str(self.value)
