package no.elhub.flex.testutil

/** The party types of the system, with the abbreviation used in test names and the database role of each. */
enum class TestPartyRole(val abbreviation: String, val type: String, val role: String) {
    BRP("BRP", "balance_responsible_party", "flex_balance_responsible_party"),
    EU("EU", "end_user", "flex_end_user"),
    ES("ES", "energy_supplier", "flex_energy_supplier"),
    FISO("FISO", "flexibility_information_system_operator", "flex_flexibility_information_system_operator"),
    MO("MO", "market_operator", "flex_market_operator"),
    SP("SP", "service_provider", "flex_service_provider"),
    SO("SO", "system_operator", "flex_system_operator"),
    TP("TP", "third_party", "flex_third_party"),
    ORG("ORG", "organisation", "flex_organisation"),
    ;

    companion object {
        /** The roles that inherit `flex_common`, i.e. every party role except the organisation. */
        val common: List<TestPartyRole> = entries - ORG

        /** The common roles that have no row level access of their own beyond `flex_common` and `flex_entity`. */
        val withoutRla: List<TestPartyRole> = common - FISO
    }
}
