from enum import StrEnum


class NoticeStatus(StrEnum):
    ACTIVE = "active"
    RESOLVED = "resolved"

    def __str__(self) -> str:
        return str(self.value)
