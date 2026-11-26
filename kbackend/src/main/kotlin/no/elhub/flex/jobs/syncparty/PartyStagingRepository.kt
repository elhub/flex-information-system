package no.elhub.flex.jobs.syncparty

import arrow.core.Either
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.DatabaseError
import no.elhub.flex.shared.db.FlexTransaction.flexTransaction
import no.elhub.flex.shared.db.RepositoryError
import no.elhub.flex.shared.db.prepareNamed
import org.koin.core.annotation.Single
import java.sql.Connection
import no.elhub.flex.shared.adapter.generated.models.Party as AdapterParty

interface PartyStagingRepository {
    /** Empties `staging.party`, ready for a new load. */
    context(principal: FlexPrincipal)
    suspend fun prepareStaging(): Either<RepositoryError, Unit>

    /** Inserts [parties] into `staging.party`. */
    context(principal: FlexPrincipal)
    suspend fun batchInsertStagingParties(parties: List<AdapterParty>): Either<RepositoryError, Unit>

    /** Runs the safety checks and merges `staging.party` into the `flex` schema. */
    context(principal: FlexPrincipal)
    suspend fun finaliseStaging(): Either<RepositoryError, Unit>
}

private val logger = KotlinLogging.logger {}

@Single(createdAtStart = true)
class PartyStagingRepositoryImpl : PartyStagingRepository {
    context(principal: FlexPrincipal)
    override suspend fun prepareStaging(): Either<RepositoryError, Unit> =
        inStagingTransaction("prepare party staging table") { conn ->
            conn.prepareStatement("SELECT staging.party_prepare()").use { it.execute() }
        }

    context(principal: FlexPrincipal)
    override suspend fun batchInsertStagingParties(parties: List<AdapterParty>): Either<RepositoryError, Unit> =
        inStagingTransaction("insert parties into staging") { conn ->
            logger.info { "Inserting ${parties.size} rows into staging.party" }
            conn.prepareNamed(
                """
                INSERT INTO staging.party (gln, org, name, type)
                SELECT * FROM unnest(:gln::text[], :org::text[], :name::text[], :type::text[])
                """,
                mapOf(
                    "gln" to conn.createArrayOf("text", parties.map { it.gln }.toTypedArray()),
                    "org" to conn.createArrayOf("text", parties.map { it.org }.toTypedArray()),
                    "name" to conn.createArrayOf("text", parties.map { it.name }.toTypedArray()),
                    "type" to conn.createArrayOf("text", parties.map { it.type.value }.toTypedArray()),
                ),
            ).use { it.execute() }
        }

    context(principal: FlexPrincipal)
    override suspend fun finaliseStaging(): Either<RepositoryError, Unit> =
        inStagingTransaction("finalise party staging") { conn ->
            logger.info { "Finalising party staging - running sanity check and merge" }
            conn.prepareStatement("SELECT staging.party_finalise()").use { it.execute() }
        }

    context(principal: FlexPrincipal)
    private suspend fun inStagingTransaction(
        description: String,
        block: (Connection) -> Unit,
    ): Either<RepositoryError, Unit> = flexTransaction<RepositoryError, Unit> { conn ->
        Either.catch { block(conn) }.mapLeft { e ->
            logger.error { "Failed to $description: ${e.message}" }
            DatabaseError("Failed to $description")
        }
    }
}
