from enum import Enum


class GeojsonPointType(str, Enum):
    POINT = "Point"

    def __str__(self) -> str:
        return str(self.value)
