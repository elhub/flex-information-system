from enum import Enum


class PartyRole(str, Enum):
    FLEX_BALANCE_RESPONSIBLE_PARTY = "flex_balance_responsible_party"
    FLEX_END_USER = "flex_end_user"
    FLEX_ENERGY_SUPPLIER = "flex_energy_supplier"
    FLEX_FLEXIBILITY_INFORMATION_SYSTEM_OPERATOR = "flex_flexibility_information_system_operator"
    FLEX_MARKET_OPERATOR = "flex_market_operator"
    FLEX_ORGANISATION = "flex_organisation"
    FLEX_SERVICE_PROVIDER = "flex_service_provider"
    FLEX_SYSTEM_OPERATOR = "flex_system_operator"
    FLEX_THIRD_PARTY = "flex_third_party"

    def __str__(self) -> str:
        return str(self.value)
