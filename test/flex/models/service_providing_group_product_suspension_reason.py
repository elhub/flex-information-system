from enum import Enum


class ServiceProvidingGroupProductSuspensionReason(str, Enum):
    FAILED_VERIFICATION = "failed_verification"
    OTHER = "other"

    def __str__(self) -> str:
        return str(self.value)
