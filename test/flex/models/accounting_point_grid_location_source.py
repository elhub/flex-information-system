from enum import StrEnum


class AccountingPointGridLocationSource(StrEnum):
    CSO = "cso"
    GRID_MODEL = "grid_model"
    SO = "so"
    SYSTEM = "system"

    def __str__(self) -> str:
        return str(self.value)
