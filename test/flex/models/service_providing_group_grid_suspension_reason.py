from enum import Enum


class ServiceProvidingGroupGridSuspensionReason(str, Enum):
    BREACH_OF_CONDITIONS = "breach_of_conditions"
    OTHER = "other"
    SIGNIFICANT_ALTERATION = "significant_alteration"

    def __str__(self) -> str:
        return str(self.value)
