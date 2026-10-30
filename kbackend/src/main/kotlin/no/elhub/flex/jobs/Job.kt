package no.elhub.flex.jobs

import arrow.core.Either
import arrow.core.left
import arrow.core.right

/**
 * Sealed class representing all available scheduled jobs.
 *
 * To add a job: create a package under `jobs` with the job, a `@Module` that scans it, and a
 * `@KoinApplication`; then add an object here and a branch in [runJob]. The [name] must match
 * the value set in the `JOB` environment variable (case-insensitive).
 */
sealed class Job(val name: String) {

    data object SyncMeteringGridAreaData : Job("sync-metering-grid-area-data")

    data object SyncGridModelData : Job("sync-grid-model-data")

    data object SyncPartyData : Job("sync-party-data")

    companion object {
        private val all: List<Job> = listOf(SyncMeteringGridAreaData, SyncGridModelData, SyncPartyData)

        fun fromString(jobName: String): Either<String, Job> =
            all.firstOrNull { it.name.equals(jobName, ignoreCase = true) }?.right()
                ?: "Unknown job '$jobName'. Known jobs: ${knownNames()}".left()

        fun knownNames(): List<String> = all.map { it.name }
    }
}
