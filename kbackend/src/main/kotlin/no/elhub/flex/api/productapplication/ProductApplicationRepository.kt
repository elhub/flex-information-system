package no.elhub.flex.api.productapplication

import arrow.core.Either
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import no.elhub.flex.shared.auth.FlexPrincipal
import no.elhub.flex.shared.db.DatabaseError
import no.elhub.flex.shared.db.FlexTransaction.flexTransaction
import no.elhub.flex.shared.db.prepareNamed
import no.elhub.flex.shared.db.querySingle

/** The part of a stored service providing group product application that is needed to validate an update. */
data class StoredProductApplication(
    val productTypeIds: List<Long>,
    val applicationDetails: JsonObject?,
    val assessmentDetails: JsonObject?,
)

/** Reads for the validation of service providing group product applications, as the caller (so RLS applies). */
interface ProductApplicationRepository {
    /** The business ID of the product type, or `null` if it does not exist. */
    context(principal: FlexPrincipal)
    suspend fun productKind(productTypeId: Long): Either<DatabaseError, String?>

    /** The application, or `null` if it does not exist or the caller cannot see it. */
    context(principal: FlexPrincipal)
    suspend fun find(id: Long): Either<DatabaseError, StoredProductApplication?>
}

class ProductApplicationRepositoryImpl : ProductApplicationRepository {
    context(principal: FlexPrincipal)
    override suspend fun productKind(productTypeId: Long): Either<DatabaseError, String?> =
        flexTransaction { conn ->
            Either.catch {
                conn.prepareNamed(
                    "SELECT business_id FROM api.product_type WHERE id = :id",
                    mapOf("id" to productTypeId),
                ).querySingle { rs -> rs.getString("business_id") }
            }.mapLeft { e -> DatabaseError("Failed to read product type id=$productTypeId: ${e.message}") }
        }

    context(principal: FlexPrincipal)
    override suspend fun find(id: Long): Either<DatabaseError, StoredProductApplication?> =
        flexTransaction { conn ->
            Either.catch {
                conn.prepareNamed(
                    """
                    SELECT product_type_ids, application_details::text, assessment_details::text
                    FROM api.service_providing_group_product_application
                    WHERE id = :id
                    """,
                    mapOf("id" to id),
                ).querySingle { rs ->
                    StoredProductApplication(
                        productTypeIds = (rs.getArray("product_type_ids").array as Array<*>).map { it as Long },
                        applicationDetails = rs.getString("application_details")?.let { Json.decodeFromString<JsonObject>(it) },
                        assessmentDetails = rs.getString("assessment_details")?.let { Json.decodeFromString<JsonObject>(it) },
                    )
                }
            }.mapLeft { e -> DatabaseError("Failed to read product application id=$id: ${e.message}") }
        }
}
