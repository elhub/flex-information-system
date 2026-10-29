from enum import StrEnum


class PartyType(StrEnum):
    BALANCE_RESPONSIBLE_PARTY = "balance_responsible_party"
    ENERGY_SUPPLIER = "energy_supplier"
    SERVICE_PROVIDER = "service_provider"
    SYSTEM_OPERATOR = "system_operator"

    def __str__(self) -> str:
        return str(self.value)
