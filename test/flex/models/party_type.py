from enum import Enum


class PartyType(str, Enum):
    BALANCE_RESPONSIBLE_PARTY = "balance_responsible_party"
    END_USER = "end_user"
    ENERGY_SUPPLIER = "energy_supplier"
    FLEXIBILITY_INFORMATION_SYSTEM_OPERATOR = "flexibility_information_system_operator"
    MARKET_OPERATOR = "market_operator"
    ORGANISATION = "organisation"
    SERVICE_PROVIDER = "service_provider"
    SYSTEM_OPERATOR = "system_operator"
    THIRD_PARTY = "third_party"

    def __str__(self) -> str:
        return str(self.value)
