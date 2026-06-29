from enum import StrEnum


class GeojsonPointType(StrEnum):
    POINT = "Point"

    def __str__(self) -> str:
        return str(self.value)
