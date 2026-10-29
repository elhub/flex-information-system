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
        /** A system principal for the notification pipeline, using role `flex_internal_event_notification` and eid `"0"`. */
        val internalEventNotification = FlexPrincipal(role = "flex_internal_event_notification", eid = "0")

        /** A system principal that bypasses RLS by using role `flex_internal_data` and eid `"0"`. */
        val internalData = FlexPrincipal(role = "flex_internal_data", eid = "0")

        /** A system principal allowed to run the `staging.*` functions and write to the staging tables. */
        val staging = FlexPrincipal(role = "flex_staging_structure_data", eid = "0")
    }
}

/** Derives a [FlexPrincipal] from this [AccessToken], extracting only the fields needed for RLS. */
fun AccessToken.toFlexPrincipal(): FlexPrincipal = FlexPrincipal(role = role, eid = extId)
