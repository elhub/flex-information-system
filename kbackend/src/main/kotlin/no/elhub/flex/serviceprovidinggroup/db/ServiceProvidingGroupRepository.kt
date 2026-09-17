package no.elhub.flex.serviceprovidinggroup.db

import arrow.core.Either
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.db.FlexTransaction.flexTransaction
import no.elhub.flex.db.prepareNamed
import no.elhub.flex.db.query
import no.elhub.flex.model.domain.db.DatabaseError
import no.elhub.flex.model.domain.db.RepositoryError
import no.elhub.flex.model.domain.serviceprovidinggroup.ControllableUnitApplications
import no.elhub.flex.model.domain.serviceprovidinggroup.ControllableUnitGridPrequalification
import no.elhub.flex.model.domain.serviceprovidinggroup.ControllableUnitProductApplication
import org.koin.core.annotation.Single
import java.time.OffsetDateTime

/**
 * Repository interface for service providing groups.
 *
 * All functions receive the caller's [FlexPrincipal] via context parameter so
 * implementations can apply the per-request RLS preamble without it being
 * threaded explicitly through every call site.
 */
interface ServiceProvidingGroupRepository {

    /**
     * Fetches the grid prequalification and product application status for each
     * controllable unit that is a member of the given service providing group.
     *
     * Grid prequalification is resolved per controllable unit (based on the system
     * operator(s) relevant to its accounting point), while product applications are
     * shared across all member controllable units of the service providing group,
     * with `prequalifiedAt` only populated if the controllable unit was
     * already a member at the time the application reached that status.
     *
     * @param serviceProvidingGroupId the surrogate key of the service providing group.
     * @return either a [RepositoryError], or the list of [ControllableUnitApplications]
     * for each member controllable unit.
     */
    context(principal: FlexPrincipal)
    suspend fun getApplicationsForControllableUnits(
        serviceProvidingGroupId: Long,
    ): Either<RepositoryError, List<ControllableUnitApplications>>
}

private val logger = KotlinLogging.logger {}

@Single(createdAtStart = true)
class ServiceProvidingGroupRepositoryImpl : ServiceProvidingGroupRepository {
    context(principal: FlexPrincipal)
    override suspend fun getApplicationsForControllableUnits(
        serviceProvidingGroupId: Long
    ): Either<RepositoryError, List<ControllableUnitApplications>> =
        flexTransaction { conn ->
            Either.catch {
                val productApplicationsByCu = conn.prepareNamed(
                    GET_PRODUCT_APPLICATIONS_FOR_EACH_CU,
                    mapOf("spgId" to serviceProvidingGroupId),
                ).query { rs ->
                    val cuId = rs.getLong("cu_id")
                    val productApplicationId = rs.getLong("product_application_id")
                    val hasProductApplication = !rs.wasNull()
                    val productApplicationPrequalifiedAt =
                        rs.getObject("product_application_prequalified_at", OffsetDateTime::class.java)
                    if (hasProductApplication) {
                        cuId to ControllableUnitProductApplication(
                            id = productApplicationId,
                            prequalifiedAt = productApplicationPrequalifiedAt,
                        )
                    } else {
                        null
                    }
                }.filterNotNull().groupBy({ it.first }, { it.second })

                conn.prepareNamed(
                    GET_GRID_PREQUALIFICATION_FOR_EACH_CU,
                    mapOf("spgId" to serviceProvidingGroupId),
                ).query { rs ->
                    val cuId = rs.getLong("cu_id")
                    val cuName = rs.getString("cu_name")
                    val gridPrequalificationId = rs.getLong("grid_prequalification_id")
                    val hasGridPrequalification = !rs.wasNull()
                    val gridPrequalificationPrequalifiedAt =
                        rs.getObject("grid_prequalification_prequalified_at", OffsetDateTime::class.java)
                    ControllableUnitApplications(
                        id = cuId,
                        name = cuName,
                        serviceProvidingGroupId = serviceProvidingGroupId,
                        gridPrequalification = if (hasGridPrequalification) {
                            ControllableUnitGridPrequalification(
                                id = gridPrequalificationId,
                                prequalifiedAt = gridPrequalificationPrequalifiedAt,
                            )
                        } else {
                            null
                        },
                        productApplications = productApplicationsByCu[cuId].orEmpty(),
                    )
                }
            }.mapLeft { e ->
                logger.error { "getApplicationsForControllableUnits failed: ${e.message}" }
                DatabaseError("Failed to read application statuses for controllable units in SPG $serviceProvidingGroupId")
            }
        }
}
