from enum import Enum


class MeteringGridAreaBusinessIdType(str, Enum):
    EIC_Y = "eic_y"

    def __str__(self) -> str:
        return str(self.value)
