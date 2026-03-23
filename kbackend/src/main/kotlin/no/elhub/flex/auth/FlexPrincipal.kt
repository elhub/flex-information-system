package no.elhub.flex.auth

/**
 * Represents the database identity used to enforce row-level security on every transaction.
 *
 * Derived from the [AccessToken] for real user requests, or constructed directly for
 * system/internal operations.
 *
 * @property role the Postgres role name — used in `SET LOCAL ROLE`
 * @property eid the external identity provider ID — `"0"` for system roles
 */
data class FlexPrincipal(
    val role: String,
    val eid: String,
) {
    companion object {
        /** A system principal that bypasses RLS by using role `flex_internal_data` and eid `"0"`. */
        fun internalData(): FlexPrincipal = FlexPrincipal(role = "flex_internal", eid = "0")
    }
}

/** Derives a [FlexPrincipal] from this [AccessToken], extracting only the fields needed for RLS. */
fun AccessToken.toFlexPrincipal(): FlexPrincipal = FlexPrincipal(role = role, eid = extId)
