from enum import Enum


class GeojsonPointCrsType(str, Enum):
    NAME = "name"

    def __str__(self) -> str:
        return str(self.value)
