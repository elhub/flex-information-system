package no.elhub.flex.jobs

import arrow.core.Either

/** Common interface that all scheduled jobs must implement. */
interface ScheduledJob {
    suspend fun run(): Either<JobError, Unit>
}
