from enum import StrEnum


class MeteringGridAreaBusinessIdType(StrEnum):
    EIC_Y = "eic_y"

    def __str__(self) -> str:
        return str(self.value)
