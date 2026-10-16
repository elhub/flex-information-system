package no.elhub.flex.notice.db

import arrow.core.Either
import arrow.core.raise.either
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.db.FlexTransaction.flexTransaction
import no.elhub.flex.db.prepareNamed
import no.elhub.flex.db.query
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.model.domain.db.RepositoryError
import org.koin.core.annotation.Single

interface NoticeRecipientRepository {
    /**
     * Returns the distinct email addresses of entities behind active parties
     * that have at least one active notice. Only entities with business ID type `email` are included.
     */
    context(principal: FlexPrincipal)
    suspend fun getActiveRecipientEmails(): Either<RepositoryError, List<String>>
}

private val logger = KotlinLogging.logger {}

@Single(createdAtStart = true)
class NoticeRecipientRepositoryImpl : NoticeRecipientRepository {

    context(principal: FlexPrincipal)
    override suspend fun getActiveRecipientEmails(): Either<RepositoryError, List<String>> =
        flexTransaction { conn ->
            either {
                runCatching {
                    conn.prepareNamed(
                        """
                        SELECT DISTINCT e.business_id AS email
                        FROM flex.notice n
                        JOIN flex.party p ON p.id = n.party_id
                        JOIN flex.entity e ON e.id = p.entity_id
                        WHERE n.status = 'active'
                          AND p.status = 'active'
                          AND e.business_id_type = 'email'
                        """,
                        emptyMap(),
                    ).query { rs -> rs.getString("email") }
                }.getOrElse { e ->
                    logger.error { "getActiveRecipientEmails failed: ${e.message}" }
                    raise(DatabaseError("Failed to read notice recipient emails"))
                }
            }
        }
}
