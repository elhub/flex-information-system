package no.elhub.flex.jobs.syncmeteringgridarea

import no.elhub.flex.jobs.JobInfrastructureModule
import no.elhub.flex.jobs.booleanEnv
import org.koin.core.annotation.ComponentScan
import org.koin.core.annotation.KoinApplication
import org.koin.core.annotation.Module
import org.koin.core.annotation.Single

data class SyncMeteringGridAreaDataConfig(
    val finalise: Boolean,
)

@Module(includes = [JobInfrastructureModule::class])
@ComponentScan("no.elhub.flex.jobs.syncmeteringgridarea")
class SyncMeteringGridAreaDataModule {

    @Single(createdAtStart = true)
    fun config(): SyncMeteringGridAreaDataConfig =
        SyncMeteringGridAreaDataConfig(finalise = booleanEnv("SYNC_METERING_GRID_AREA_DATA_FINALISE"))
}

@KoinApplication(modules = [SyncMeteringGridAreaDataModule::class])
class SyncMeteringGridAreaDataApp
