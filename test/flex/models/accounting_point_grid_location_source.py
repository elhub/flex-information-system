from enum import Enum


class AccountingPointGridLocationSource(str, Enum):
    CSO = "cso"
    GRID_MODEL = "grid_model"
    SO = "so"
    SYSTEM = "system"

    def __str__(self) -> str:
        return str(self.value)
