package no.elhub.flex.api.productapplication

import arrow.core.Either
import arrow.core.getOrElse
import arrow.core.left
import arrow.core.right
import io.github.oshai.kotlinlogging.KotlinLogging
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.longOrNull
import no.elhub.flex.api.postgrest.PostgrestRouteVariant
import no.elhub.flex.api.postgrest.RequestRejection
import no.elhub.flex.auth.plugin.accessToken
import no.elhub.flex.auth.token.toFlexPrincipal

private val logger = KotlinLogging.logger {}

private const val VALIDATION_ERROR_CODE = "PT400"
private const val PRODUCT_TYPE_IDS = "product_type_ids"
private const val APPLICATION_DETAILS = "application_details"
private const val ASSESSMENT_DETAILS = "assessment_details"

/**
 * `POST` and `PATCH` of service providing group product applications. The product-specific details are validated
 * and the deprecated columns are synced before the request goes to PostgREST (SPGPA-VAL012 and SPGPA-VAL013).
 *
 * An update that does not touch the product types, the details or the deprecated columns is not validated.
 */
class ProductApplicationWriteVariant(private val repo: ProductApplicationRepository) : PostgrestRouteVariant {
    private val validatedFields = setOf(PRODUCT_TYPE_IDS, APPLICATION_DETAILS, ASSESSMENT_DETAILS) + legacyColumns

    override suspend fun rewriteBody(
        call: ApplicationCall,
        method: HttpMethod,
        path: String,
        body: ByteArray,
    ): Either<RequestRejection, ByteArray> {
        val request = Either.catch { Json.parseToJsonElement(body.decodeToString()) as? JsonObject }.getOrNull()
            ?: return reject("request body must be a JSON object").left()

        val isUpdate = method == HttpMethod.Patch
        if (isUpdate && request.keys.none { it in validatedFields }) return body.right()

        return with(call.accessToken.toFlexPrincipal()) {
            val stored = if (isUpdate) {
                val id = path.substringAfterLast('/').toLongOrNull()
                    ?: return body.right() // not a valid id: PostgREST reports it
                repo.find(id).getOrElse { return serverError(it.message).left() }
                    ?: return body.right() // does not exist or not visible: PostgREST reports it
            } else {
                null
            }

            val productTypeIds = (request[PRODUCT_TYPE_IDS] as? JsonArray)?.map { (it as? JsonPrimitive)?.longOrNull }
                ?: stored?.productTypeIds
            val productTypeId = productTypeIds?.singleOrNull()
                ?: return reject("product_type_ids must contain exactly one product type").left()
            val productKind = repo.productKind(productTypeId).getOrElse { return serverError(it.message).left() }
                ?: return reject("product_type_ids contains an unknown product type").left()

            val synced = syncLegacyColumns(productKind, request, stored?.applicationDetails).getOrElse {
                return reject(it).left()
            }

            val problems = validateDetails(
                productKind,
                application = if (APPLICATION_DETAILS in synced) synced[APPLICATION_DETAILS] else stored?.applicationDetails,
                assessment = if (ASSESSMENT_DETAILS in synced) synced[ASSESSMENT_DETAILS] else stored?.assessmentDetails,
            )
            if (problems.isNotEmpty()) return reject(problems.joinToString("; ")).left()

            Json.encodeToString(JsonElement.serializer(), synced).encodeToByteArray().right()
        }
    }

    private fun reject(message: String) = RequestRejection(HttpStatusCode.BadRequest, message, code = VALIDATION_ERROR_CODE)

    private fun serverError(message: String): RequestRejection {
        logger.error { message }
        return RequestRejection(HttpStatusCode.InternalServerError, "Internal Server Error")
    }
}
