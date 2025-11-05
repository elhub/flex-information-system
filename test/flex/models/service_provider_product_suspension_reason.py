from enum import Enum


class ServiceProviderProductSuspensionReason(str, Enum):
    BREACH_OF_CONDITIONS = "breach_of_conditions"
    CLEARING_ISSUES = "clearing_issues"
    COMMUNICATION_ISSUES = "communication_issues"
    FAILING_HEARTBEAT = "failing_heartbeat"
    OTHER = "other"
    SYSTEM_ISSUES = "system_issues"

    def __str__(self) -> str:
        return str(self.value)
