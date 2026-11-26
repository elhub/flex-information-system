package no.elhub.flex.jobs.sendnoticemail

import arrow.core.Either
import arrow.core.raise.either
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.DatabaseError
import no.elhub.flex.shared.db.FlexTransaction.flexTransaction
import no.elhub.flex.shared.db.RepositoryError
import no.elhub.flex.shared.db.prepareNamed
import no.elhub.flex.shared.db.query
import org.koin.core.annotation.Single

data class NoticeRecipient(val entityId: Long, val name: String, val email: String)

interface NoticeRecipientRepository {
    /**
     * Returns the distinct entities behind active parties that have at least one active notice.
     * Only entities with business ID type `email` are included.
     */
    context(principal: FlexPrincipal)
    suspend fun getActiveRecipients(): Either<RepositoryError, List<NoticeRecipient>>
}

private val logger = KotlinLogging.logger {}

@Single(createdAtStart = true)
class NoticeRecipientRepositoryImpl : NoticeRecipientRepository {

    context(principal: FlexPrincipal)
    override suspend fun getActiveRecipients(): Either<RepositoryError, List<NoticeRecipient>> =
        flexTransaction { conn ->
            either {
                runCatching {
                    conn.prepareNamed(
                        """
                        SELECT DISTINCT e.id, e.name, e.business_id AS email
                        FROM flex.notice n
                        JOIN flex.party_membership pm ON n.party_id = pm.party_id
                        JOIN flex.party p ON p.id = pm.party_id
                        JOIN flex.entity e ON e.id = pm.entity_id
                        WHERE n.status = 'active'
                          AND p.status = 'active'
                          AND e.business_id_type = 'email'
                        """,
                        emptyMap(),
                    ).query { rs -> NoticeRecipient(rs.getLong("id"), rs.getString("name"), rs.getString("email")) }
                }.getOrElse { e ->
                    logger.error { "getActiveRecipients failed: ${e.message}" }
                    raise(DatabaseError("Failed to read notice recipients"))
                }
            }
        }
}
