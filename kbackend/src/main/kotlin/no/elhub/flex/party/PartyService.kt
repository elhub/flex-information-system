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
