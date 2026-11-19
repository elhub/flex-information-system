package no.elhub.flex.jobs.sendspgparejectedmail

import arrow.core.Either
import arrow.core.raise.either
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.jobs.sendnoticemail.NoticeRecipient
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.DatabaseError
import no.elhub.flex.shared.db.FlexTransaction.flexTransaction
import no.elhub.flex.shared.db.RepositoryError
import no.elhub.flex.shared.db.prepareNamed
import no.elhub.flex.shared.db.query
import org.koin.core.annotation.Single
import java.time.OffsetDateTime

interface RejectedSpgpaRecipientRepository {
    /**
     * Returns the distinct email entities in the service providers whose SPG product application was last
     * changed to `rejected` in `[from, to)` by the procuring system operator.
     */
    context(principal: FlexPrincipal)
    suspend fun getRecipients(from: OffsetDateTime, to: OffsetDateTime): Either<RepositoryError, List<NoticeRecipient>>
}

private val logger = KotlinLogging.logger {}

@Single(createdAtStart = true)
class RejectedSpgpaRecipientRepositoryImpl : RejectedSpgpaRecipientRepository {

    context(principal: FlexPrincipal)
    override suspend fun getRecipients(
        from: OffsetDateTime,
        to: OffsetDateTime,
    ): Either<RepositoryError, List<NoticeRecipient>> =
        flexTransaction { conn ->
            either {
                runCatching {
                    conn.prepareNamed(
                        """
                        SELECT DISTINCT e.id, e.name, e.business_id AS email
                        FROM flex.service_providing_group_product_application spgpa
                        JOIN flex.service_providing_group spg ON spg.id = spgpa.service_providing_group_id
                        JOIN flex.party pty ON pty.id = spg.service_provider_id
                        JOIN flex.party_membership pm ON pm.party_id = pty.id
                        JOIN flex.entity e ON e.id = pm.entity_id
                        WHERE spgpa.status = 'rejected'
                          AND lower(spgpa.record_time_range) >= :from
                          AND lower(spgpa.record_time_range) < :to
                          AND auth.party_of_identity(spgpa.recorded_by) = spgpa.procuring_system_operator_id
                          AND EXISTS (
                              SELECT 1
                              FROM flex.service_providing_group_product_application_history previous
                              WHERE previous.id = spgpa.id
                                AND previous.status <> 'rejected'
                                AND upper(previous.record_time_range) = lower(spgpa.record_time_range)
                          )
                          AND pty.status = 'active'
                          AND e.business_id_type = 'email'
                        """,
                        mapOf("from" to from, "to" to to),
                    ).query { rs -> NoticeRecipient(rs.getLong("id"), rs.getString("name"), rs.getString("email")) }
                }.getOrElse { e ->
                    logger.error { "getRecipients failed: ${e.message}" }
                    raise(DatabaseError("Failed to read rejected SPG product application recipients"))
                }
            }
        }
}
