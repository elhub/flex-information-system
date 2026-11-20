package no.elhub.flex.jobs.eventworker

import kotlin.time.Duration
import kotlin.time.Duration.Companion.seconds

/**
 * Settings of the event worker.
 *
 * @property pollInterval how long to wait before polling again when there was nothing to process, or the batch failed
 * @property batchSize the maximum number of events processed in one transaction
 */
data class EventWorkerConfig(
    val pollInterval: Duration = DEFAULT_POLL_INTERVAL,
    val batchSize: Int = DEFAULT_BATCH_SIZE,
) {
    init {
        require(pollInterval.isPositive()) { "The poll interval must be positive" }
        require(batchSize > 0) { "The batch size must be positive" }
    }

    companion object {
        val DEFAULT_POLL_INTERVAL: Duration = 10.seconds
        const val DEFAULT_BATCH_SIZE = 42

        /** Reads the config from environment variables. */
        fun fromEnv(): EventWorkerConfig = EventWorkerConfig(
            pollInterval = System.getenv("EVENT_WORKER_POLL_INTERVAL")?.let { Duration.parse(it) } ?: DEFAULT_POLL_INTERVAL,
            batchSize = System.getenv("EVENT_WORKER_BATCH_SIZE")?.toInt() ?: DEFAULT_BATCH_SIZE,
        )
    }
}
