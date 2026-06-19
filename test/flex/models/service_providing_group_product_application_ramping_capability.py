from enum import Enum


class ServiceProvidingGroupProductApplicationRampingCapability(str, Enum):
    ALWAYS = "always"
    NEVER = "never"
    PARTIAL = "partial"

    def __str__(self) -> str:
        return str(self.value)
