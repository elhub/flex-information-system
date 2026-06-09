package no.elhub.flex.event.db

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.db.FlexTransaction.flexTransaction
import no.elhub.flex.db.prepareNamed
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.model.domain.db.RepositoryError
import org.koin.core.annotation.Single

/**
 * Repository for events.
 *
 * All functions receive the caller's [FlexPrincipal] via context parameter so
 * implementations can apply the per-request RLS preamble without it being
 * threaded explicitly through every call site.
 */
interface EventRepository {

    /**
     * Creates one `no.elhub.flex.controllable_unit.lookup` event per entry in [controllableUnitIds], giving information
     * about [requestingPartyId] in the event data. */
    context(principal: FlexPrincipal)
    suspend fun insertLookupEvent(
        accountingPointBusinessId: String,
        controllableUnitBusinessId: String?,
        requestingPartyId: Int
    ): Either<RepositoryError, Unit>
}

private val logger = KotlinLogging.logger {}

@Single(createdAtStart = true)
class EventRepositoryImpl : EventRepository {

    context(principal: FlexPrincipal)
    override suspend fun insertLookupEvent(
        accountingPointBusinessId: String,
        controllableUnitBusinessId: String?,
        requestingPartyId: Int,
    ): Either<RepositoryError, Unit> = flexTransaction { conn ->
        runCatching {
            if (controllableUnitBusinessId != null) {
                // lookup was done on specific CU: add it as subject of the event
                conn.prepareNamed(
                    """
                INSERT INTO flex.event (type, source_resource, source_id, subject_resource, subject_id, data)
                SELECT
                    public.text2ltree('no.elhub.flex.controllable_unit.lookup'),
                    'accounting_point',
                    (SELECT id FROM flex.accounting_point WHERE business_id::text = :apBusinessId),
                    'controllable_unit',
                    (SELECT id FROM flex.controllable_unit WHERE business_id::text = :cuBusinessId),
                    jsonb_build_object(
                        'requesting_party_name',
                        (SELECT name FROM flex.party WHERE id = :partyId)
                    )
                """,
                    mapOf(
                        "apBusinessId" to accountingPointBusinessId,
                        "cuBusinessId" to controllableUnitBusinessId,
                        "partyId" to requestingPartyId
                    ),
                ).use { it.execute() }
            } else {
                // general lookup on the AP: no subject
                conn.prepareNamed(
                    """
                INSERT INTO flex.event (type, source_resource, source_id, data)
                SELECT
                    public.text2ltree('no.elhub.flex.controllable_unit.lookup'),
                    'accounting_point',
                    (SELECT id FROM flex.accounting_point WHERE business_id::text = :apBusinessId),
                    jsonb_build_object(
                        'requesting_party_name',
                        (SELECT name FROM flex.party WHERE id = :partyId)
                    )
                """,
                    mapOf(
                        "apBusinessId" to accountingPointBusinessId,
                        "partyId" to requestingPartyId
                    ),
                ).use { it.execute() }
            }
        }.fold(
            onSuccess = { Unit.right() },
            onFailure = { e ->
                logger.error { "insertLookupEvent failed: ${e.message}" }
                DatabaseError("failed to insert lookup events: ${e.message}").left()
            },
        )
    }
}
