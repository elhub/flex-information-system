from enum import StrEnum


class TechnicalResourceBusinessIdType(StrEnum):
    MAC = "mac"
    OTHER = "other"
    SERIAL_NUMBER = "serial_number"

    def __str__(self) -> str:
        return str(self.value)
