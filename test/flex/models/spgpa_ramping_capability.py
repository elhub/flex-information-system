from enum import StrEnum


class SpgpaRampingCapability(StrEnum):
    ALWAYS = "always"
    NEVER = "never"
    PARTIAL = "partial"

    def __str__(self) -> str:
        return str(self.value)
