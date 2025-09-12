from enum import Enum


class ServiceProviderProductSuspensionReason(str, Enum):
    CLEARING_ISSUES = "clearing_issues"
    COMMUNICATION_ISSUES = "communication_issues"
    FAILED_VERIFICATION = "failed_verification"
    FAILING_HEARTBEAT = "failing_heartbeat"
    OTHER = "other"
    SYSTEM_ISSUES = "system_issues"

    def __str__(self) -> str:
        return str(self.value)
