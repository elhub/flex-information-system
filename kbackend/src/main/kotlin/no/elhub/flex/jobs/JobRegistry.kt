package no.elhub.flex.jobs

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
    private val sendNoticeMail: SendNoticeMailJob,
    private val syncGridModelData: SyncGridModelDataJob,
) {
    fun resolve(job: Job): ScheduledJob = when (job) {
        is Job.SyncMeteringGridAreaData -> syncMeteringGridAreaData
        is Job.SendNoticeMail -> sendNoticeMail
        is Job.SyncGridModelData -> syncGridModelData
    }
}
