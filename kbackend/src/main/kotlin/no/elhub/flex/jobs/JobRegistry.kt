package no.elhub.flex.jobs

import no.elhub.flex.jobs.syncgridmodel.SyncGridModelDataJob
import no.elhub.flex.jobs.syncmeteringgridarea.SyncMeteringGridAreaDataJob

/**
 * Resolves a [Job] to its [ScheduledJob] implementation.
 *
 * To add a new job:
 * 1. Add a new object to [Job].
 * 2. Inject it here and add a `is Job.YourNewJob` branch below.
 * 3. Wire it up in `appModule`.
 */
class JobRegistry(
    private val syncMeteringGridAreaData: SyncMeteringGridAreaDataJob,
    private val syncGridModelData: SyncGridModelDataJob,
) {
    fun resolve(job: Job): ScheduledJob = when (job) {
        is Job.SyncMeteringGridAreaData -> syncMeteringGridAreaData
        is Job.SyncGridModelData -> syncGridModelData
    }
}
