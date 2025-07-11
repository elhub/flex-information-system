from enum import Enum


class PartyBusinessIdType(str, Enum):
    EIC_X = "eic_x"
    GLN = "gln"
    ORG = "org"
    UUID = "uuid"

    def __str__(self) -> str:
        return str(self.value)
