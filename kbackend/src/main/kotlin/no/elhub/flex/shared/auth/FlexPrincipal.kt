package no.elhub.flex.shared.auth

/**
 * Represents the database identity used to enforce row-level security on every transaction.
 *
 * Derived from an access token for real user requests, or constructed directly for
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
        val internalData = FlexPrincipal(role = "flex_internal_data", eid = "0")

        /** A system principal allowed to run the `staging.*` functions and write to the staging tables. */
        val staging = FlexPrincipal(role = "flex_staging_structure_data", eid = "0")
    }
}
