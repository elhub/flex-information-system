package no.elhub.flex.jobs.syncgridmodel

import arrow.core.Either
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.shared.adapter.generated.models.Line
import no.elhub.flex.shared.adapter.generated.models.Substation
import no.elhub.flex.shared.adapter.generated.models.SubstationCluster
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.DatabaseError
import no.elhub.flex.shared.db.FlexTransaction.flexTransaction
import no.elhub.flex.shared.db.RepositoryError
import no.elhub.flex.shared.db.prepareNamed
import java.sql.Connection

interface GridModelRepository {
    /** Empties the three grid model staging tables (substation cluster, substation, line), ready for a new load. */
    context(principal: FlexPrincipal)
    suspend fun prepareStaging(): Either<RepositoryError, Unit>

    /** Inserts [substations] into `staging.substation`. */
    context(principal: FlexPrincipal)
    suspend fun batchInsertStagingSubstations(substations: List<Substation>): Either<RepositoryError, Unit>

    /** Inserts [clusters] into `staging.substation_cluster`. */
    context(principal: FlexPrincipal)
    suspend fun batchInsertStagingSubstationClusters(clusters: List<SubstationCluster>): Either<RepositoryError, Unit>

    /** Inserts [lines] into `staging.line`. */
    context(principal: FlexPrincipal)
    suspend fun batchInsertStagingLines(lines: List<Line>): Either<RepositoryError, Unit>

    /** Runs the safety checks and merges the three grid model staging tables into the `flex` schema. */
    context(principal: FlexPrincipal)
    suspend fun finaliseStaging(): Either<RepositoryError, Unit>
}

private val logger = KotlinLogging.logger {}

class GridModelRepositoryImpl : GridModelRepository {
    context(principal: FlexPrincipal)
    override suspend fun prepareStaging(): Either<RepositoryError, Unit> =
        inStagingTransaction("prepare grid model staging tables") { conn ->
            conn.prepareStatement("SELECT staging.substation_prepare()").use { it.execute() }
        }

    context(principal: FlexPrincipal)
    override suspend fun batchInsertStagingSubstations(substations: List<Substation>): Either<RepositoryError, Unit> =
        inStagingTransaction("insert substations into staging") { conn ->
            logger.info { "Inserting ${substations.size} rows into staging.substation" }
            // Voltage levels is a List<Double> for each substation. As the fields inside unnest
            // are the data of all substations, it would have been a 2D array. Such values cannot
            // be cast directly to numeric[][] in Postgres. Instead, we cast each substation's
            // voltage levels to a text value before injecting into the query, so unnest handles a
            // text[] that will then be interpreted as a numeric[] for each substation.
            conn.prepareNamed(
                """
                INSERT INTO staging.substation (
                    mrid, name, kind, primary_concessionaire, substation_cluster_mrid, voltage_levels, lat, lon
                )
                SELECT mrid, name, kind, primary_concessionaire, substation_cluster_mrid,
                    voltage_levels::numeric(9, 3)[], lat, lon
                FROM unnest(
                    :mrid::text[], :name::text[], :kind::text[], :primaryConcessionaire::text[],
                    :substationClusterMrid::text[], :voltageLevels::text[], :lat::numeric[], :lon::numeric[]
                ) AS src(mrid, name, kind, primary_concessionaire, substation_cluster_mrid, voltage_levels, lat, lon)
                """,
                mapOf(
                    "mrid" to conn.textArray(substations.map { it.mrid.toString() }),
                    "name" to conn.textArray(substations.map { it.name }),
                    "kind" to conn.textArray(substations.map { it.kind }),
                    "primaryConcessionaire" to conn.textArray(substations.map { it.primaryConcessionaire }),
                    "substationClusterMrid" to conn.textArray(substations.map { it.substationClusterMrid.toString() }),
                    "voltageLevels" to conn.textArray(
                        substations.map { s -> s.voltageLevels.joinToString(",", "{", "}") },
                    ),
                    "lat" to conn.numericArray(substations.map { it.latitude }),
                    "lon" to conn.numericArray(substations.map { it.longitude }),
                ),
            ).use { it.execute() }
        }

    context(principal: FlexPrincipal)
    override suspend fun batchInsertStagingSubstationClusters(
        clusters: List<SubstationCluster>,
    ): Either<RepositoryError, Unit> =
        inStagingTransaction("insert substation clusters into staging") { conn ->
            logger.info { "Inserting ${clusters.size} rows into staging.substation_cluster" }
            conn.prepareNamed(
                """
                INSERT INTO staging.substation_cluster (mrid, name, lat, lon)
                SELECT * FROM unnest(:mrid::text[], :name::text[], :lat::numeric[], :lon::numeric[])
                """,
                mapOf(
                    "mrid" to conn.textArray(clusters.map { it.mrid.toString() }),
                    "name" to conn.textArray(clusters.map { it.name }),
                    "lat" to conn.numericArray(clusters.map { it.latitude }),
                    "lon" to conn.numericArray(clusters.map { it.longitude }),
                ),
            ).use { it.execute() }
        }

    context(principal: FlexPrincipal)
    override suspend fun batchInsertStagingLines(lines: List<Line>): Either<RepositoryError, Unit> =
        inStagingTransaction("insert lines into staging") { conn ->
            logger.info { "Inserting ${lines.size} rows into staging.line" }
            conn.prepareNamed(
                """
                INSERT INTO staging.line (mrid, name, from_substation_cluster_mrid, to_substation_cluster_mrid)
                SELECT * FROM unnest(:mrid::text[], :name::text[], :fromMrid::text[], :toMrid::text[])
                """,
                mapOf(
                    "mrid" to conn.textArray(lines.map { it.mrid.toString() }),
                    "name" to conn.textArray(lines.map { it.name }),
                    "fromMrid" to conn.textArray(lines.map { it.fromSubstationClusterMrid.toString() }),
                    "toMrid" to conn.textArray(lines.map { it.toSubstationClusterMrid.toString() }),
                ),
            ).use { it.execute() }
        }

    context(principal: FlexPrincipal)
    override suspend fun finaliseStaging(): Either<RepositoryError, Unit> =
        inStagingTransaction("finalise grid model staging") { conn ->
            logger.info { "Finalising grid model staging - running sanity checks and merge" }
            conn.prepareStatement("SELECT staging.substation_finalise()").use { it.execute() }
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

private fun Connection.textArray(values: List<String>) = createArrayOf("text", values.toTypedArray())

private fun Connection.numericArray(values: List<Double>) = createArrayOf("numeric", values.toTypedArray())
