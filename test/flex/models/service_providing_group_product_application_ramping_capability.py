from enum import StrEnum


class ServiceProvidingGroupProductApplicationRampingCapability(StrEnum):
    ALWAYS = "always"
    NEVER = "never"
    PARTIAL = "partial"

    def __str__(self) -> str:
        return str(self.value)
