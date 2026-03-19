from enum import Enum


class Category(str, Enum):
    CONSUMPTION = "consumption"
    ENERGY_STORAGE = "energy_storage"
    PRODUCTION = "production"

    def __str__(self) -> str:
        return str(self.value)
