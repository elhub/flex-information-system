from enum import StrEnum


class Category(StrEnum):
    CONSUMPTION = "consumption"
    ENERGY_STORAGE = "energy_storage"
    PRODUCTION = "production"

    def __str__(self) -> str:
        return str(self.value)
