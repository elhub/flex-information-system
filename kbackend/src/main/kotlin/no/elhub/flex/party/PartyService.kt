package no.elhub.flex.party

import com.github.benmanes.caffeine.cache.Cache
import com.github.benmanes.caffeine.cache.Caffeine
import io.github.oshai.kotlinlogging.KotlinLogging
import no.elhub.flex.auth.FlexPrincipal
import no.elhub.flex.model.domain.Party
import no.elhub.flex.party.db.PartyRepository
import org.koin.core.annotation.Single
import java.time.Duration

private val CACHE_TTL: Duration = Duration.ofHours(1)
private const val CACHE_MAX_SIZE: Long = 10_000

interface PartyService {
    /**
     * Resolves the party with the given internal ID.
     *
     * Results are cached in memory (see [CACHE_TTL]/[CACHE_MAX_SIZE]) since this is primarily used
     * for metrics tagging, where a short staleness window (e.g. after a party rename) is acceptable.
     *
     * Returns `null` if the party does not exist, or if the lookup fails for any reason. Failed
     * lookups are not cached, so a subsequent call will retry against the database.
     */
    suspend fun getParty(partyId: Long): Party?
}

@Single(createdAtStart = true)
class PartyServiceImpl(
    private val partyRepository: PartyRepository,
) : PartyService {
    companion object {
        private val logger = KotlinLogging.logger {}
    }

    // Parties are not visibility-scoped by the caller's own principal — metrics tagging needs to
    // resolve any party, regardless of who is making the request that's being measured.
    // This uses the `flex_internal_data` role (bypasses RLS), same as e.g. AccountingPointServiceImpl.
    private val cache: Cache<Long, Party> = Caffeine.newBuilder()
        .expireAfterWrite(CACHE_TTL)
        .maximumSize(CACHE_MAX_SIZE)
        .build()

    override suspend fun getParty(partyId: Long): Party? {
        cache.getIfPresent(partyId)?.let { return it }

        return with(FlexPrincipal.internalData()) {
            partyRepository.getById(partyId)
        }.fold(
            { error ->
                logger.warn { "Failed to resolve party $partyId: $error" }
                null
            },
            { party ->
                cache.put(partyId, party)
                party
            },
        )
    }
}
