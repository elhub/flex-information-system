from enum import StrEnum


class MeteringGridAreaStatus(StrEnum):
    ACTIVE = "active"
    INACTIVE = "inactive"

    def __str__(self) -> str:
        return str(self.value)
