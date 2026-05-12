from enum import Enum


class TechnicalResourceBusinessIdType(str, Enum):
    MAC = "mac"
    OTHER = "other"
    SERIAL_NUMBER = "serial_number"

    def __str__(self) -> str:
        return str(self.value)
