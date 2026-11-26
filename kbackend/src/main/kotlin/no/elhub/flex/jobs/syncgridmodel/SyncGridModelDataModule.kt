package no.elhub.flex.jobs.syncgridmodel

import no.elhub.flex.jobs.JobInfrastructureModule
import no.elhub.flex.jobs.booleanEnv
import org.koin.core.annotation.ComponentScan
import org.koin.core.annotation.KoinApplication
import org.koin.core.annotation.Module
import org.koin.core.annotation.Single

data class SyncGridModelDataConfig(
    val finalise: Boolean,
)

@Module(includes = [JobInfrastructureModule::class])
@ComponentScan("no.elhub.flex.jobs.syncgridmodel")
class SyncGridModelDataModule {

    @Single(createdAtStart = true)
    fun config(): SyncGridModelDataConfig =
        SyncGridModelDataConfig(finalise = booleanEnv("SYNC_GRID_MODEL_DATA_FINALISE"))
}

@KoinApplication(modules = [SyncGridModelDataModule::class])
class SyncGridModelDataApp
